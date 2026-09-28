import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";
import type { VectorPadValue } from "../src/index.js";
import Demo from "./fixtures/VectorPadFixture.svelte";
import BoundDemo from "./fixtures/VectorPadBoundFixture.svelte";
import PartsDemo from "./fixtures/VectorPadPartsFixture.svelte";

afterEach(cleanup);

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="vector-pad"][data-part="${name}"]`)!;
const thumb = () => screen.getByRole("slider");
const field = (axis: "X" | "Y") =>
  screen.getByRole("spinbutton", { name: axis }) as HTMLInputElement;
const spoken = () => thumb().getAttribute("aria-valuetext");

/*
 * jsdom lays nothing out: the pad is given a 200px box at the page's corner,
 * so a point on it maps to a known value (-100 to 100 each way, y up).
 */
function layOutPad() {
  vi.spyOn(part("control"), "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width: 200,
    height: 200,
    right: 200,
    bottom: 200,
    toJSON: () => ({}),
  });
}

/*
 * jsdom has no PointerEvent; a MouseEvent of the pointer type carries the
 * coordinates and button the machine reads.
 */
async function pointer(type: string, target: EventTarget, clientX: number, clientY: number) {
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: 1,
      clientX,
      clientY,
    }),
  );
  await tick();
}

describe("VectorPad (Svelte)", () => {
  it("applies the recipe to the root part, defaulting to md, and sizes the fields with it", () => {
    render(Demo, { props: { size: "lg" as const } });
    expect(part("root").getAttribute("data-size")).toBe("lg");
    const fieldRoots = document.querySelectorAll('[data-scope="number-input"][data-part="root"]');
    expect([...fieldRoots].map((root) => root.getAttribute("data-size"))).toEqual(["lg", "lg"]);

    cleanup();
    render(Demo);
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to the root and to each part, and lets a field be renamed", () => {
    render(PartsDemo);
    expect(part("root").className).toBe("offset");
    expect(part("root").dataset.testid).toBe("pad");
    expect(part("control").title).toBe("Drag me");
    expect(part("thumb").className).toBe("knob");
    expect(screen.getByRole("spinbutton", { name: "Horizontal" })).toBeDefined();
  });

  it("nests the grid, the crosshair and the handle in the pad", () => {
    render(Demo);
    for (const name of ["grid", "crosshair", "thumb"]) {
      expect(part("control").contains(part(name)), name).toBe(true);
    }
    expect(part("grid").getAttribute("aria-hidden")).toBe("true");
  });

  it("makes the handle a slider named by the label that says both values", () => {
    render(Demo, { props: { defaultValue: { x: 20, y: -10 } } });
    expect(thumb()).toBe(part("thumb"));
    expect(thumb().getAttribute("aria-labelledby")).toBe(part("label").id);
    expect(spoken()).toBe("X 20, Y -10");
    expect(screen.getByRole("group", { name: "Offset" })).toBe(part("root"));
    expect(part("root").style.getPropertyValue("--vector-pad-x")).toBe("60%");
    expect(part("root").style.getPropertyValue("--vector-pad-y")).toBe("55%");
  });

  it("lets the consumer word the spoken value", () => {
    render(Demo, {
      props: { getAriaValueText: ({ x, y }: VectorPadValue) => `${x} a la derecha, ${y} arriba` },
    });
    expect(spoken()).toBe("0 a la derecha, 0 arriba");
  });

  it("sets x and y where the pad is pressed, and follows a drag live, held at the edges", async () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    render(Demo, { props: { onValueChange, onValueChangeEnd } });
    layOutPad();

    await pointer("pointerdown", part("control"), 150, 50);
    await waitFor(() => expect(spoken()).toBe("X 50, Y 50"));
    expect(part("thumb").hasAttribute("data-dragging")).toBe(true);

    await pointer("pointermove", document, 120, 140);
    await waitFor(() => expect(spoken()).toBe("X 20, Y -40"));
    await waitFor(() => expect(field("X").value).toBe("20"));
    expect(field("Y").value).toBe("-40");
    expect(onValueChangeEnd).not.toHaveBeenCalled();

    // The pointer leaves the pad: the handle keeps following, held at the edge.
    await pointer("pointermove", document, 400, -300);
    await waitFor(() => expect(spoken()).toBe("X 100, Y 100"));

    await pointer("pointerup", document, 400, -300);
    await waitFor(() =>
      expect(onValueChangeEnd).toHaveBeenCalledWith({ value: { x: 100, y: 100 } }),
    );
    expect(onValueChange.mock.calls.map(([details]) => details.value)).toEqual([
      { x: 50, y: 50 },
      { x: 20, y: -40 },
      { x: 100, y: 100 },
    ]);
    await waitFor(() => expect(document.activeElement).toBe(thumb()));
  });

  it("puts the largest y at the bottom with invertY, while the handle still follows the pointer", async () => {
    render(Demo, { props: { invertY: true } });
    layOutPad();
    await pointer("pointerdown", part("control"), 150, 50);
    await waitFor(() => expect(spoken()).toBe("X 50, Y -50"));
    expect(part("root").style.getPropertyValue("--vector-pad-y")).toBe("25%");
  });

  it("moves one step per arrow, ten with Shift, and goes back to defaultValue on Home", async () => {
    const user = userEvent.setup();
    const onValueChangeEnd = vi.fn();
    render(Demo, { props: { defaultValue: { x: 10, y: 10 }, step: 2, onValueChangeEnd } });
    await user.tab();
    expect(document.activeElement).toBe(thumb());

    await user.keyboard("{ArrowRight}{ArrowUp}");
    await waitFor(() => expect(spoken()).toBe("X 12, Y 12"));
    expect(onValueChangeEnd).toHaveBeenLastCalledWith({ value: { x: 12, y: 12 } });
    await user.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await waitFor(() => expect(spoken()).toBe("X 12, Y -8"));
    await user.keyboard("{ArrowLeft}");
    await waitFor(() => expect(spoken()).toBe("X 10, Y -8"));
    await user.keyboard("{Home}");
    await waitFor(() => expect(spoken()).toBe("X 10, Y 10"));
  });

  it("goes back to defaultValue on a double-click on the pad", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { defaultValue: { x: 5, y: 5 } } });
    await user.tab();
    await user.keyboard("{Shift>}{ArrowRight}{/Shift}");
    await waitFor(() => expect(spoken()).toBe("X 15, Y 5"));
    await fireEvent.dblClick(part("control"));
    await waitFor(() => expect(spoken()).toBe("X 5, Y 5"));
  });

  it("takes min, max and step per axis, in the handle and in the fields", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { min: 0, max: { x: 10, y: 1 }, step: { x: 1, y: 0.1 } } });
    expect(spoken()).toBe("X 5, Y 0.5");
    expect(field("Y").getAttribute("aria-valuemax")).toBe("1");
    await user.tab();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    await waitFor(() => expect(spoken()).toBe("X 5, Y 0.7"));
  });

  it("moves the handle from a field at once, kept in the range, and settles the text on commit", async () => {
    const user = userEvent.setup({ delay: 20 });
    render(Demo, { props: { step: 5 } });

    await user.clear(field("X"));
    await user.type(field("X"), "32");
    await waitFor(() => expect(spoken()).toBe("X 30, Y 0"));
    // The text is left alone while typing…
    expect(field("X").value).toBe("32");
    // …and settles to the handle's value once committed.
    await user.tab();
    await waitFor(() => expect(field("X").value).toBe("30"));

    await user.clear(field("Y"));
    await user.type(field("Y"), "-250");
    await waitFor(() => expect(spoken()).toBe("X 30, Y -100"));
    await user.keyboard("{Enter}");
    await waitFor(() => expect(field("Y").value).toBe("-100"));
  });

  it("steps the value with a field's arrow keys", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { defaultValue: { x: 0, y: 99 } } });
    await user.click(field("Y"));
    await user.keyboard("{ArrowUp}{ArrowUp}");
    await waitFor(() => expect(spoken()).toBe("X 0, Y 100"));
  });

  it("focuses the handle when the label is clicked", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(part("label"));
    expect(document.activeElement).toBe(thumb());
  });

  it("writes each value back to bind:value, even one that starts unset, and follows it", async () => {
    const user = userEvent.setup();
    render(BoundDemo);
    expect(screen.getByRole("status").textContent).toBe("unset");
    await user.tab();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("1,0"));

    await user.click(screen.getByRole("button", { name: "Move" }));
    await waitFor(() => expect(spoken()).toBe("X -5, Y 6"));
  });

  it("disables the pad and the fields and takes the handle out of the tab order", async () => {
    render(Demo, { props: { defaultValue: { x: 40, y: 40 }, disabled: true } });
    layOutPad();
    for (const name of ["root", "label", "control", "thumb"]) {
      expect(part(name).hasAttribute("data-disabled"), name).toBe(true);
    }
    expect(thumb().hasAttribute("tabindex")).toBe(false);
    expect(thumb().getAttribute("aria-disabled")).toBe("true");
    expect(field("X").disabled).toBe(true);
    await pointer("pointerdown", part("control"), 0, 0);
    await fireEvent.keyDown(thumb(), { key: "ArrowRight" });
    expect(spoken()).toBe("X 40, Y 40");
  });
});
