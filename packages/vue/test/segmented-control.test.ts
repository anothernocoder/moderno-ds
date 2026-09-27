import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, nextTick, ref, type PropType } from "vue";
import { Field, SegmentedControl, type SegmentedControlSize } from "../src/index.js";

afterEach(cleanup);

describe("SegmentedControl surface (Vue)", () => {
  it("exposes every Ark part but Label, and wraps Root and ItemText", async () => {
    const { SegmentGroup: ArkSegmentGroup } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkSegmentGroup)) {
      if (part === "Label") continue; // the root is the track; see segmented-control.ts
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

const segments = () =>
  OPTIONS.map((option) =>
    h(
      SegmentedControl.Item,
      { key: option.value, value: option.value, disabled: option.disabled },
      () => [
        h(SegmentedControl.ItemText, {}, () => option.label),
        h(SegmentedControl.ItemHiddenInput),
      ],
    ),
  );

const Demo = defineComponent({
  props: {
    size: { type: String as PropType<SegmentedControlSize>, default: undefined },
    fullWidth: { type: Boolean, default: false },
    disabled: { type: Boolean, default: undefined },
    defaultValue: { type: String, default: undefined },
    modelValue: { type: String, default: undefined },
    onValueChange: { type: Function, default: undefined },
  },
  setup(props) {
    return () =>
      h(
        SegmentedControl.Root,
        {
          size: props.size,
          fullWidth: props.fullWidth,
          disabled: props.disabled,
          defaultValue: props.defaultValue,
          modelValue: props.modelValue,
          name: "scale",
          "aria-label": "Scale",
          class: "scale",
          onValueChange: props.onValueChange as (() => void) | undefined,
        },
        () => [h(SegmentedControl.Indicator), ...segments()],
      );
  },
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="segment-group"][data-part="${name}"]`)!;
const parts = (name: string) =>
  Array.from(
    document.querySelectorAll<HTMLElement>(`[data-scope="segment-group"][data-part="${name}"]`),
  );
const radio = (name: string) => screen.getByRole("radio", { name }) as HTMLInputElement;
const states = () => parts("item").map((item) => item.getAttribute("data-state"));

describe("SegmentedControl (Vue)", () => {
  it("puts size and fullWidth on the root, defaulting to md and its own width", async () => {
    const { rerender } = render(Demo, { props: { size: "lg", fullWidth: true } });
    expect(part("root").getAttribute("data-size")).toBe("lg");
    expect(part("root").hasAttribute("data-full-width")).toBe(true);

    await rerender({ size: undefined, fullWidth: false });
    expect(part("root").getAttribute("data-size")).toBe("md");
    expect(part("root").hasAttribute("data-full-width")).toBe(false);
  });

  it("lays the segments out in a row and forwards native props to the root", () => {
    render(Demo);
    expect(part("root").getAttribute("data-orientation")).toBe("horizontal");
    expect(part("root").className).toBe("scale");
    expect(part("indicator")).toBeTruthy();
  });

  it("is a named radiogroup of native radios", () => {
    render(Demo);
    expect(screen.getByRole("radiogroup", { name: "Scale" })).toBe(part("root"));
    const fit = radio("Fit");
    expect(fit.type).toBe("radio");
    expect(fit.name).toBe("scale");
    expect(fit.value).toBe("fit");
  });

  it("names an icon-only option by its hidden ItemText", () => {
    render(() =>
      h(SegmentedControl.Root, { "aria-label": "Alignment", defaultValue: "left" }, () => [
        h(SegmentedControl.Item, { value: "left" }, () => [
          h("svg", { "aria-hidden": "true" }),
          h(SegmentedControl.ItemText, { hidden: true }, () => "Align left"),
          h(SegmentedControl.ItemHiddenInput),
        ]),
      ]),
    );
    expect(radio("Align left").checked).toBe(true);
  });

  it("selects an option when clicked and reports it (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: "fit", onValueChange } });
    expect(states()).toEqual(["checked", "unchecked", "unchecked"]);

    await user.click(screen.getByText("Fill"));

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: "fill" }));
    expect(states()).toEqual(["unchecked", "checked", "unchecked"]);
    expect(radio("Fill").checked).toBe(true);
  });

  it("keeps v-model in step both ways", async () => {
    const user = userEvent.setup();
    const value = ref<string | null>("fill");
    render(() =>
      h(
        SegmentedControl.Root,
        {
          "aria-label": "Scale",
          modelValue: value.value,
          "onUpdate:modelValue": (next: string | null) => (value.value = next),
        },
        () => segments(),
      ),
    );
    expect(states()).toEqual(["unchecked", "checked", "unchecked"]);

    await user.click(screen.getByText("Fit"));
    expect(value.value).toBe("fit");
    expect(states()).toEqual(["checked", "unchecked", "unchecked"]);

    value.value = "fill";
    await nextTick();
    expect(states()).toEqual(["unchecked", "checked", "unchecked"]);
  });

  it("enters on Tab at the checked radio, and the arrow keys move and select", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: "fill", onValueChange } });
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
    render(Demo, { props: { defaultValue: "fit", onValueChange } });
    expect(parts("item")[2]!.hasAttribute("data-disabled")).toBe(true);
    expect(radio("Stretch").disabled).toBe(true);
    expect(part("root").hasAttribute("data-disabled")).toBe(false);

    await user.click(screen.getByText("Stretch"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(states()[2]).toBe("unchecked");
  });

  it("disables the whole control", () => {
    render(Demo, { props: { disabled: true } });
    expect(part("root").hasAttribute("data-disabled")).toBe(true);
    for (const input of screen.getAllByRole("radio") as HTMLInputElement[]) {
      expect(input.disabled).toBe(true);
    }
  });

  it("titles a cut-off label with its full text when the pointer enters it", async () => {
    const user = userEvent.setup();
    render(Demo);
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

describe("SegmentedControl in a Field (Vue)", () => {
  const ScaleField = defineComponent({
    props: {
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
    },
    setup(props) {
      return () =>
        h(Field.Root, { disabled: props.disabled, invalid: props.invalid }, () => [
          h(Field.Label, {}, () => "Scale"),
          h(SegmentedControl.Root, { defaultValue: "fit" }, () => [
            h(SegmentedControl.Indicator),
            ...segments().slice(0, 2),
          ]),
          h(Field.HelperText, {}, () => "How the image fills its frame."),
        ]);
    },
  });

  it("is named by the Field's label and described by its helper text", async () => {
    render(ScaleField);
    await nextTick();
    const group = screen.getByRole("radiogroup", { name: "Scale" });
    expect(group).toBe(part("root"));
    const describedBy = group.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)?.textContent).toBe(
      "How the image fills its frame.",
    );
  });

  it("follows the Field's disabled and invalid state", () => {
    render(ScaleField, { props: { disabled: true, invalid: true } });
    expect(part("root").hasAttribute("data-disabled")).toBe(true);
    expect(part("root").hasAttribute("data-invalid")).toBe(true);
    for (const input of screen.getAllByRole("radio") as HTMLInputElement[]) {
      expect(input.disabled).toBe(true);
    }
  });
});
