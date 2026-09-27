import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { createSignal, For } from "solid-js";
import {
  AngleSlider,
  type AngleSliderSize,
  type AngleSliderValueChangeDetails,
} from "../src/index.jsx";

afterEach(cleanup);

describe("AngleSlider surface (Solid)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { AngleSlider: ArkAngleSlider } = await import("@ark-ui/solid");
    for (const part of Object.keys(ArkAngleSlider)) {
      expect(
        AngleSlider[part as keyof typeof AngleSlider],
        `AngleSlider.${part} missing`,
      ).toBeDefined();
    }
    expect(AngleSlider.Input).toBeDefined();
  });
});

function Demo(props: {
  size?: AngleSliderSize;
  value?: number;
  defaultValue?: number;
  step?: number;
  marks?: number[];
  disabled?: boolean;
  onValueChange?: (details: AngleSliderValueChangeDetails) => void;
  onValueChangeEnd?: (details: AngleSliderValueChangeDetails) => void;
}) {
  return (
    <AngleSlider.Root
      size={props.size}
      value={props.value}
      defaultValue={props.defaultValue}
      step={props.step}
      marks={props.marks}
      disabled={props.disabled}
      onValueChange={props.onValueChange}
      onValueChangeEnd={props.onValueChangeEnd}
      class="rotation"
    >
      <AngleSlider.Label>Rotation</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
        <AngleSlider.MarkerGroup>
          <For each={props.marks ?? []}>{(mark) => <AngleSlider.Marker value={mark} />}</For>
        </AngleSlider.MarkerGroup>
      </AngleSlider.Control>
      <AngleSlider.Input />
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="angle-slider"][data-part="${name}"]`)!;
const parts = (name: string) => [
  ...document.querySelectorAll<HTMLElement>(`[data-scope="angle-slider"][data-part="${name}"]`),
];
const thumb = () => screen.getByRole("slider");
const field = () => screen.getByRole("spinbutton") as HTMLInputElement;

/*
 * jsdom lays nothing out: the dial is given a 100px box at the page's
 * corner, so a point on its edge maps to a known angle (0° up, clockwise).
 */
function layOutDial() {
  vi.spyOn(part("control"), "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    toJSON: () => ({}),
  });
}

/** The point on the dial's edge at `angle` degrees. */
function pointAt(angle: number) {
  const radians = (angle * Math.PI) / 180;
  return { clientX: 50 + 50 * Math.sin(radians), clientY: 50 - 50 * Math.cos(radians) };
}

/*
 * jsdom has no PointerEvent; a MouseEvent of the pointer type carries the
 * coordinates, button and Shift key that Ark's control and drag read.
 */
function pointer(type: string, target: EventTarget, angle: number, shiftKey = false) {
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: 1,
      shiftKey,
      ...pointAt(angle),
    }),
  );
}

describe("AngleSlider", () => {
  it("applies the recipe to the root part, defaulting to md, and sizes the field with it", () => {
    render(() => <Demo size="lg" defaultValue={45} />);
    expect(part("root").getAttribute("data-size")).toBe("lg");
    expect(
      document
        .querySelector('[data-scope="number-input"][data-part="root"]')!
        .getAttribute("data-size"),
    ).toBe("lg");
    expect(part("control").contains(part("thumb"))).toBe(true);

    cleanup();
    render(() => <Demo defaultValue={45} />);
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to Ark's root", () => {
    render(() => <Demo />);
    expect(part("root").className).toBe("rotation");
  });

  it("makes the thumb a slider named by the label that says its angle in degrees", () => {
    render(() => <Demo defaultValue={45} />);
    expect(thumb()).toBe(part("thumb"));
    expect(thumb().getAttribute("aria-labelledby")).toBe(part("label").id);
    expect(thumb().getAttribute("aria-valuenow")).toBe("45");
    expect(thumb().getAttribute("aria-valuemin")).toBe("0");
    expect(thumb().getAttribute("aria-valuemax")).toBe("360");
    expect(thumb().getAttribute("aria-valuetext")).toBe("45 degrees");
    expect(part("root").style.getPropertyValue("--angle")).toBe("45deg");
    expect(document.querySelector<HTMLInputElement>('input[type="hidden"]')!.value).toBe("45");
  });

  it("lets the consumer word the spoken value", () => {
    render(() => (
      <AngleSlider.Root defaultValue={90} getAriaValueText={(value) => `${value} grados`}>
        <AngleSlider.Control>
          <AngleSlider.Thumb />
        </AngleSlider.Control>
      </AngleSlider.Root>
    ));
    expect(thumb().getAttribute("aria-valuetext")).toBe("90 grados");
  });

  it("shows the angle in a number field with a ° suffix, named by the label", () => {
    render(() => <Demo defaultValue={45} />);
    expect(field().value).toBe("45°");
    expect(field().getAttribute("aria-labelledby")).toBe(part("label").id);
    expect(field().getAttribute("aria-valuetext")).toBe("45 degrees");
  });

  it("marks each marker under, at or over the angle", () => {
    render(() => <Demo defaultValue={90} marks={[0, 90, 180]} />);
    expect(parts("marker").map((m) => m.getAttribute("data-state"))).toEqual([
      "under-value",
      "at-value",
      "over-value",
    ]);
  });

  it("steps with the arrow keys, goes to 0° and 359° with Home and End, and turns 15° a page", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    render(() => (
      <Demo
        defaultValue={40}
        step={5}
        onValueChange={onValueChange}
        onValueChangeEnd={onValueChangeEnd}
      />
    ));
    await user.tab();
    expect(document.activeElement).toBe(thumb());

    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("45"));
    expect(onValueChange).toHaveBeenLastCalledWith({ value: 45, valueAsDegree: "45deg" });
    await user.keyboard("{PageUp}");
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("60"));
    expect(onValueChangeEnd).toHaveBeenLastCalledWith({ value: 60, valueAsDegree: "60deg" });
    await user.keyboard("{PageDown}{PageDown}");
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("30"));
    await user.keyboard("{End}");
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("359"));
    await user.keyboard("{PageUp}");
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("355"));
    await user.keyboard("{Home}");
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("0"));
    await user.keyboard("{PageDown}");
    expect(thumb().getAttribute("aria-valuenow")).toBe("0");
  });

  it("sets the angle where the dial is clicked, and follows a drag past 360° on to 0°", async () => {
    const onValueChange = vi.fn();
    render(() => <Demo defaultValue={0} onValueChange={onValueChange} />);
    layOutDial();

    pointer("pointerdown", part("control"), 90);
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("90"));
    pointer("pointerup", document, 90);

    pointer("pointerdown", part("control"), 340);
    pointer("pointermove", document, 355);
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("355"));
    pointer("pointermove", document, 10);
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("10"));
    pointer("pointerup", document, 10);
    // 355° → 10°: the angle carries on from 0°, it never runs back round the dial.
    const reported = onValueChange.mock.calls.map(([details]) => details.value);
    expect(reported).toEqual([90, 340, 355, 10]);
  });

  it("wraps a step that lands on a full turn to 0°", async () => {
    render(() => <Demo defaultValue={0} step={45} />);
    layOutDial();
    pointer("pointerdown", part("control"), 340);
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("0"));
    expect(field().value).toBe("0°");
  });

  it("snaps to the nearest mark while Shift is held during a drag, and only then", async () => {
    render(() => <Demo defaultValue={0} marks={[0, 45, 90]} />);
    layOutDial();

    pointer("pointerdown", part("control"), 50, true);
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("45"));
    pointer("pointermove", document, 80, true);
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("90"));
    pointer("pointermove", document, 70);
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("70"));
    pointer("pointerup", document, 70);
  });

  it("sets the dial from the field, wrapped and snapped to the step, and settles the text on commit", async () => {
    // A key per frame, as a person types: Ark writes the field's text back on
    // the next animation frame.
    const user = userEvent.setup({ delay: 20 });
    render(() => <Demo defaultValue={0} step={5} />);

    await user.clear(field());
    await user.type(field(), "92");
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("90"));
    // The caret's text is left alone while typing…
    expect(field().value).toBe("92");
    // …and settles to the dial's angle once committed.
    await user.tab();
    await waitFor(() => expect(field().value).toBe("90°"));

    await user.clear(field());
    await user.type(field(), "400");
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("40"));
    await user.keyboard("{Enter}");
    await waitFor(() => expect(field().value).toBe("40°"));
  });

  it("wraps the field's arrow keys past 359°", async () => {
    const user = userEvent.setup();
    render(() => <Demo defaultValue={359} />);
    await user.click(field());
    await user.keyboard("{ArrowUp}");
    await waitFor(() => expect(thumb().getAttribute("aria-valuenow")).toBe("0"));
  });

  it("follows the dial in the field", async () => {
    const user = userEvent.setup();
    render(() => <Demo defaultValue={10} />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(field().value).toBe("11°"));
  });

  it("follows a controlled value", async () => {
    const [value, setValue] = createSignal(30);
    render(() => <Demo value={value()} />);
    setValue(370);
    expect(thumb().getAttribute("aria-valuenow")).toBe("10");
    await waitFor(() => expect(field().value).toBe("10°"));
  });

  it("holds a controlled value the consumer does not change", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(() => <Demo value={30} onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith({ value: 31, valueAsDegree: "31deg" });
    expect(thumb().getAttribute("aria-valuenow")).toBe("30");
  });

  it("disables the dial and the field and takes the thumb out of the tab order", () => {
    render(() => <Demo defaultValue={40} disabled />);
    for (const name of ["root", "label", "control", "thumb"]) {
      expect(part(name).hasAttribute("data-disabled"), name).toBe(true);
    }
    expect(thumb().hasAttribute("tabindex")).toBe(false);
    expect(field().disabled).toBe(true);
    fireEvent.keyDown(thumb(), { key: "PageUp" });
    expect(thumb().getAttribute("aria-valuenow")).toBe("40");
  });
});
