// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  NumberInput,
  type NumberInputSize,
  type NumberInputValueChangeDetails,
} from "../src/index.js";

afterEach(cleanup);

describe("NumberInput surface (React)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { NumberInput: ArkNumberInput } = await import("@ark-ui/react");
    for (const part of Object.keys(ArkNumberInput)) {
      if (part === "Root") continue; // wrapped below
      expect(
        NumberInput[part as keyof typeof NumberInput],
        `NumberInput.${part} missing`,
      ).toBeDefined();
    }
  });
});

function Demo(props: {
  size?: NumberInputSize;
  value?: string;
  defaultValue?: string;
  min?: number;
  max?: number;
  step?: number;
  formatOptions?: Intl.NumberFormatOptions;
  disabled?: boolean;
  invalid?: boolean;
  onValueChange?: (details: NumberInputValueChangeDetails) => void;
}) {
  return (
    <NumberInput.Root
      size={props.size}
      value={props.value}
      defaultValue={props.defaultValue}
      min={props.min}
      max={props.max}
      step={props.step}
      formatOptions={props.formatOptions}
      disabled={props.disabled}
      invalid={props.invalid}
      onValueChange={props.onValueChange}
      className="quantity"
    >
      <NumberInput.Label>Quantity</NumberInput.Label>
      <NumberInput.Control>
        <NumberInput.Input />
        <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
        <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="number-input"][data-part="${name}"]`)!;
const input = () => screen.getByRole<HTMLInputElement>("spinbutton", { name: "Quantity" });

describe("NumberInput", () => {
  it("applies the recipe to the root part, defaulting to md", () => {
    render(<Demo size="lg" defaultValue="3" />);
    expect(part("root").getAttribute("data-size")).toBe("lg");
    // Ark's own anatomy is intact around the recipe attribute.
    expect(part("control").contains(part("input"))).toBe(true);
    expect(part("control").contains(part("decrement-trigger"))).toBe(true);
    expect(part("control").contains(part("increment-trigger"))).toBe(true);

    cleanup();
    render(<Demo defaultValue="3" />);
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to Ark's root", () => {
    render(<Demo defaultValue="3" />);
    expect(part("root").className).toBe("quantity");
  });

  it("makes the input a spinbutton named by the label, with its value and bounds", () => {
    render(<Demo defaultValue="3" min={1} max={10} />);
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
    render(<Demo defaultValue="3" step={2} onValueChange={onValueChange} />);
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
    render(<Demo defaultValue="10" min={0} max={10} />);
    expect(part("increment-trigger")).toHaveProperty("disabled", true);
    expect(part("increment-trigger").hasAttribute("data-disabled")).toBe(true);
    expect(part("decrement-trigger")).toHaveProperty("disabled", false);
  });

  it("clamps a typed value to min and max when the input loses focus", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue="5" min={0} max={10} />);
    await user.clear(input());
    await user.type(input(), "42");
    expect(part("control").hasAttribute("data-invalid")).toBe(true);
    await user.tab();
    await waitFor(() => expect(input().value).toBe("10"));
    expect(part("control").hasAttribute("data-invalid")).toBe(false);
  });

  it("formats the value with formatOptions", () => {
    render(<Demo defaultValue="1234.5" formatOptions={{ style: "currency", currency: "USD" }} />);
    expect(input().value).toBe("$1,234.50");
    expect(input().getAttribute("aria-valuenow")).toBe("1234.5");
  });

  it("follows a controlled value", async () => {
    const { rerender } = render(<Demo value="3" />);
    rerender(<Demo value="7" />);
    // Ark writes the new value into the input after the render.
    await waitFor(() => expect(input().value).toBe("7"));
    expect(input().getAttribute("aria-valuenow")).toBe("7");
  });

  it("marks an invalid value on the control and the input", () => {
    render(<Demo defaultValue="3" invalid />);
    expect(part("control").hasAttribute("data-invalid")).toBe(true);
    expect(input().getAttribute("aria-invalid")).toBe("true");
  });

  it("disables every part, the input and both steppers", () => {
    render(<Demo defaultValue="3" disabled />);
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
