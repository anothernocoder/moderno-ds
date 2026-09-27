import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {
  Field,
  SegmentedControl,
  type SegmentedControlSize,
  type SegmentedControlValueChangeDetails,
} from "../src/index.jsx";

afterEach(cleanup);

describe("SegmentedControl surface (Solid)", () => {
  it("exposes every Ark part but Label, and wraps Root and ItemText", async () => {
    const { SegmentGroup: ArkSegmentGroup } = await import("@ark-ui/solid");
    for (const part of Object.keys(ArkSegmentGroup)) {
      if (part === "Label") continue; // the root is the track; see segmented-control.tsx
      expect(
        SegmentedControl[part as keyof typeof SegmentedControl],
        `SegmentedControl.${part} missing`,
      ).toBeDefined();
    }
    expect("Label" in SegmentedControl).toBe(false);
    expect(SegmentedControl.Root).not.toBe(ArkSegmentGroup.Root);
    expect(SegmentedControl.ItemText).not.toBe(ArkSegmentGroup.ItemText);
  });
});

const OPTIONS = [
  { value: "fit", label: "Fit" },
  { value: "fill", label: "Fill" },
  { value: "stretch", label: "Stretch", disabled: true },
];

function Segments(props: { count?: number }) {
  return OPTIONS.slice(0, props.count ?? OPTIONS.length).map((option) => (
    <SegmentedControl.Item value={option.value} disabled={option.disabled}>
      <SegmentedControl.ItemText>{option.label}</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
  ));
}

function Demo(props: {
  size?: SegmentedControlSize;
  fullWidth?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (details: SegmentedControlValueChangeDetails) => void;
}) {
  return (
    <SegmentedControl.Root
      size={props.size}
      fullWidth={props.fullWidth}
      disabled={props.disabled}
      defaultValue={props.defaultValue}
      value={props.value}
      onValueChange={props.onValueChange}
      name="scale"
      aria-label="Scale"
      class="scale"
    >
      <SegmentedControl.Indicator />
      <Segments />
    </SegmentedControl.Root>
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="segment-group"][data-part="${name}"]`)!;
const parts = (name: string) =>
  Array.from(
    document.querySelectorAll<HTMLElement>(`[data-scope="segment-group"][data-part="${name}"]`),
  );
const radio = (name: string) => screen.getByRole("radio", { name }) as HTMLInputElement;
const states = () => parts("item").map((item) => item.getAttribute("data-state"));

describe("SegmentedControl (Solid)", () => {
  it("puts size and fullWidth on the root, defaulting to md and its own width", () => {
    const [size, setSize] = createSignal<SegmentedControlSize | undefined>("lg");
    const [fullWidth, setFullWidth] = createSignal(true);
    render(() => <Demo size={size()} fullWidth={fullWidth()} />);
    expect(part("root").getAttribute("data-size")).toBe("lg");
    expect(part("root").hasAttribute("data-full-width")).toBe(true);

    setSize(undefined);
    setFullWidth(false);
    expect(part("root").getAttribute("data-size")).toBe("md");
    expect(part("root").hasAttribute("data-full-width")).toBe(false);
  });

  it("lays the segments out in a row and forwards native props to the root", () => {
    render(() => <Demo />);
    expect(part("root").getAttribute("data-orientation")).toBe("horizontal");
    expect(part("root").className).toBe("scale");
    expect(part("indicator")).toBeTruthy();
  });

  it("is a named radiogroup of native radios", () => {
    render(() => <Demo />);
    expect(screen.getByRole("radiogroup", { name: "Scale" })).toBe(part("root"));
    const fit = radio("Fit");
    expect(fit.type).toBe("radio");
    expect(fit.name).toBe("scale");
    expect(fit.value).toBe("fit");
  });

  it("names an icon-only option by its hidden ItemText", () => {
    render(() => (
      <SegmentedControl.Root aria-label="Alignment" defaultValue="left">
        <SegmentedControl.Item value="left">
          <svg aria-hidden="true" />
          <SegmentedControl.ItemText hidden>Align left</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
      </SegmentedControl.Root>
    ));
    expect(radio("Align left").checked).toBe(true);
  });

  it("selects an option when clicked and reports it (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(() => <Demo defaultValue="fit" onValueChange={onValueChange} />);
    expect(states()).toEqual(["checked", "unchecked", "unchecked"]);

    await user.click(screen.getByText("Fill"));

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: "fill" }));
    expect(states()).toEqual(["unchecked", "checked", "unchecked"]);
    expect(radio("Fill").checked).toBe(true);
  });

  it("keeps a controlled value in step with its owner's signal", async () => {
    const user = userEvent.setup();
    const [value, setValue] = createSignal<string | null>("fill");
    render(() => (
      <Demo value={value() ?? undefined} onValueChange={(details) => setValue(details.value)} />
    ));
    expect(states()).toEqual(["unchecked", "checked", "unchecked"]);

    await user.click(screen.getByText("Fit"));
    expect(value()).toBe("fit");
    expect(states()).toEqual(["checked", "unchecked", "unchecked"]);

    setValue("fill");
    expect(states()).toEqual(["unchecked", "checked", "unchecked"]);
  });

  it("enters on Tab at the checked radio, and the arrow keys move and select", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(() => <Demo defaultValue="fill" onValueChange={onValueChange} />);
    await user.tab();
    expect(document.activeElement).toBe(radio("Fill"));

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(radio("Fit"));
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: "fit" }));
    expect(states()).toEqual(["checked", "unchecked", "unchecked"]);
  });

  it("disables one option: marked, inert and skipped", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(() => <Demo defaultValue="fit" onValueChange={onValueChange} />);
    expect(parts("item")[2]!.hasAttribute("data-disabled")).toBe(true);
    expect(radio("Stretch").disabled).toBe(true);
    expect(part("root").hasAttribute("data-disabled")).toBe(false);

    await user.click(screen.getByText("Stretch"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(states()[2]).toBe("unchecked");
  });

  it("disables the whole control", () => {
    render(() => <Demo disabled />);
    expect(part("root").hasAttribute("data-disabled")).toBe(true);
    for (const input of screen.getAllByRole("radio") as HTMLInputElement[]) {
      expect(input.disabled).toBe(true);
    }
  });

  it("titles a cut-off label with its full text when the pointer enters it", async () => {
    const user = userEvent.setup();
    render(() => <Demo />);
    const text = screen.getByText("Stretch");
    Object.defineProperty(text, "scrollWidth", { configurable: true, value: 120 });
    Object.defineProperty(text, "clientWidth", { configurable: true, value: 60 });
    await user.hover(text);
    expect(text.getAttribute("title")).toBe("Stretch");

    const fits = screen.getByText("Fit");
    await user.hover(fits);
    expect(fits.hasAttribute("title")).toBe(false);
  });
});

describe("SegmentedControl in a Field (Solid)", () => {
  function ScaleField(props: { disabled?: boolean; invalid?: boolean }) {
    return (
      <Field.Root disabled={props.disabled} invalid={props.invalid}>
        <Field.Label>Scale</Field.Label>
        <SegmentedControl.Root defaultValue="fit">
          <SegmentedControl.Indicator />
          <Segments count={2} />
        </SegmentedControl.Root>
        <Field.HelperText>How the image fills its frame.</Field.HelperText>
      </Field.Root>
    );
  }

  it("is named by the Field's label and described by its helper text", () => {
    render(() => <ScaleField />);
    const group = screen.getByRole("radiogroup", { name: "Scale" });
    expect(group).toBe(part("root"));
    const describedBy = group.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)?.textContent).toBe(
      "How the image fills its frame.",
    );
  });

  it("follows the Field's disabled and invalid state", () => {
    render(() => <ScaleField disabled invalid />);
    expect(part("root").hasAttribute("data-disabled")).toBe(true);
    expect(part("root").hasAttribute("data-invalid")).toBe(true);
    for (const input of screen.getAllByRole("radio") as HTMLInputElement[]) {
      expect(input.disabled).toBe(true);
    }
  });
});
