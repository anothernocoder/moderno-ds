import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, type PropType } from "vue";
import {
  NumberInput,
  type NumberInputSize,
  type NumberInputValueChangeDetails,
} from "../src/index.js";

afterEach(cleanup);

describe("NumberInput surface (Vue)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { NumberInput: ArkNumberInput } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkNumberInput)) {
      if (part === "Root") continue; // wrapped below
      expect(
        NumberInput[part as keyof typeof NumberInput],
        `NumberInput.${part} missing`,
      ).toBeDefined();
    }
  });
});

const Demo = defineComponent({
  props: {
    size: { type: String as PropType<NumberInputSize>, default: undefined },
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    step: { type: Number, default: undefined },
    formatOptions: { type: Object as PropType<Intl.NumberFormatOptions>, default: undefined },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: undefined },
    onValueChange: {
      type: Function as PropType<(details: NumberInputValueChangeDetails) => void>,
      default: undefined,
    },
  },
  setup(props) {
    return () =>
      h(
        NumberInput.Root,
        {
          size: props.size,
          modelValue: props.value,
          defaultValue: props.defaultValue,
          min: props.min,
          max: props.max,
          step: props.step,
          formatOptions: props.formatOptions,
          disabled: props.disabled,
          invalid: props.invalid,
          onValueChange: props.onValueChange,
          class: "quantity",
        },
        () => [
          h(NumberInput.Label, {}, () => "Quantity"),
          h(NumberInput.Control, {}, () => [
            h(NumberInput.Input),
            h(NumberInput.DecrementTrigger, {}, () => "−"),
            h(NumberInput.IncrementTrigger, {}, () => "+"),
          ]),
        ],
      );
  },
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="number-input"][data-part="${name}"]`)!;
const input = () => screen.getByRole<HTMLInputElement>("spinbutton", { name: "Quantity" });

describe("NumberInput", () => {
  it("applies the recipe to the root part, defaulting to md", () => {
    render(Demo, { props: { size: "lg" as const, defaultValue: "3" } });
    expect(part("root").getAttribute("data-size")).toBe("lg");
    // Ark's own anatomy is intact around the recipe attribute.
    expect(part("control").contains(part("input"))).toBe(true);
    expect(part("control").contains(part("decrement-trigger"))).toBe(true);
    expect(part("control").contains(part("increment-trigger"))).toBe(true);

    cleanup();
    render(Demo, { props: { defaultValue: "3" } });
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native attributes to Ark's root", () => {
    render(Demo, { props: { defaultValue: "3" } });
    expect(part("root").className).toBe("quantity");
  });

  it("makes the input a spinbutton named by the label, with its value and bounds", () => {
    render(Demo, { props: { defaultValue: "3", min: 1, max: 10 } });
    expect(input()).toBe(part("input"));
    expect(input().value).toBe("3");
    expect(input().getAttribute("aria-valuenow")).toBe("3");
    expect(input().getAttribute("aria-valuemin")).toBe("1");
    expect(input().getAttribute("aria-valuemax")).toBe("10");
    // The steppers name themselves and point at the input they change.
    expect(part("increment-trigger").getAttribute("aria-controls")).toBe(input().id);
    expect(part("increment-trigger").getAttribute("aria-label")).toBeTruthy();
    expect(part("decrement-trigger").getAttribute("aria-label")).toBeTruthy();
  });

  it("steps the value with the arrow keys and the steppers, and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: "3", step: 2, onValueChange } });
    await user.click(input());
    await user.keyboard("{ArrowUp}");
    await waitFor(() => expect(input().value).toBe("5"));
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: "5", valueAsNumber: 5 }),
    );

    await user.click(part("decrement-trigger"));
    await waitFor(() => expect(input().value).toBe("3"));
    await user.click(part("increment-trigger"));
    await waitFor(() => expect(input().value).toBe("5"));
  });

  it("stops at max: the increment stepper is disabled there", () => {
    render(Demo, { props: { defaultValue: "10", min: 0, max: 10 } });
    expect(part("increment-trigger")).toHaveProperty("disabled", true);
    expect(part("increment-trigger").hasAttribute("data-disabled")).toBe(true);
    expect(part("decrement-trigger")).toHaveProperty("disabled", false);
  });

  it("clamps a typed value to min and max when the input loses focus", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { defaultValue: "5", min: 0, max: 10 } });
    await user.clear(input());
    await user.type(input(), "42");
    await waitFor(() => expect(part("control").hasAttribute("data-invalid")).toBe(true));
    await user.tab();
    await waitFor(() => expect(input().value).toBe("10"));
    expect(part("control").hasAttribute("data-invalid")).toBe(false);
  });

  it("formats the value with formatOptions", () => {
    render(Demo, {
      props: { defaultValue: "1234.5", formatOptions: { style: "currency", currency: "USD" } },
    });
    expect(input().value).toBe("$1,234.50");
    expect(input().getAttribute("aria-valuenow")).toBe("1234.5");
  });

  it("follows a controlled value", async () => {
    const { rerender } = render(Demo, { props: { value: "3" } });
    await rerender({ value: "7" });
    // Ark writes the new value into the input after the render.
    await waitFor(() => expect(input().value).toBe("7"));
    expect(input().getAttribute("aria-valuenow")).toBe("7");
  });

  it("marks an invalid value on the control and the input", () => {
    render(Demo, { props: { defaultValue: "3", invalid: true } });
    expect(part("control").hasAttribute("data-invalid")).toBe(true);
    expect(input().getAttribute("aria-invalid")).toBe("true");
  });

  it("disables every part, the input and both steppers", () => {
    render(Demo, { props: { defaultValue: "3", disabled: true } });
    for (const name of [
      "root",
      "label",
      "control",
      "input",
      "decrement-trigger",
      "increment-trigger",
    ]) {
      expect(part(name).hasAttribute("data-disabled"), name).toBe(true);
    }
    expect(input().disabled).toBe(true);
    expect(part("increment-trigger")).toHaveProperty("disabled", true);
    expect(part("decrement-trigger")).toHaveProperty("disabled", true);
  });
});
