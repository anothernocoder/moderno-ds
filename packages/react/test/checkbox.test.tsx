// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox, type CheckboxCheckedChangeDetails } from "../src/index.js";

afterEach(cleanup);

describe("Checkbox surface (React)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    // The spread keeps parts Ark adds in future versions (Group, RootProvider,
    // …) from silently dropping out of Moderno.
    const { Checkbox: ArkCheckbox } = await import("@ark-ui/react");
    for (const part of Object.keys(ArkCheckbox)) {
      if (part === "Root") continue; // wrapped to inject the size recipe
      expect(
        Checkbox[part as keyof typeof Checkbox],
        `Checkbox.${part} missing vs @ark-ui/react`,
      ).toBeDefined();
    }
  });
});

function Demo(props: {
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  defaultChecked?: boolean | "indeterminate";
  onCheckedChange?: (details: CheckboxCheckedChangeDetails) => void;
}) {
  return (
    <Checkbox.Root
      size={props.size}
      disabled={props.disabled}
      defaultChecked={props.defaultChecked}
      onCheckedChange={props.onCheckedChange}
    >
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
        <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Email me updates</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
  );
}

const root = () => document.querySelector('[data-scope="checkbox"][data-part="root"]')!;
const control = () => document.querySelector('[data-scope="checkbox"][data-part="control"]')!;

describe("Checkbox", () => {
  it("applies the size recipe to the root part, defaulting to md", () => {
    const { container } = render(<Demo size="lg" />);
    expect(root().getAttribute("data-size")).toBe("lg");
    // Ark's own anatomy is intact around the recipe attribute.
    expect(container.querySelector('[data-scope="checkbox"][data-part="label"]')).toBeTruthy();
    expect(container.querySelector('[data-scope="checkbox"][data-part="control"]')).toBeTruthy();

    cleanup();
    render(<Demo />);
    expect(root().getAttribute("data-size")).toBe("md");
  });

  it("binds the label to a hidden native input so forms and a11y work", () => {
    render(<Demo />);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.type).toBe("checkbox");
    expect(root().getAttribute("for")).toBe(input.id);
    expect(input.checked).toBe(false);
    expect(control().getAttribute("data-state")).toBe("unchecked");
  });

  it("toggles on click and reports the new checked state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Demo onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByText("Email me updates"));

    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
    expect(control().getAttribute("data-state")).toBe("checked");
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
  });

  it("renders the indeterminate state with its own data-state and indicator", () => {
    render(<Demo defaultChecked="indeterminate" />);
    expect(control().getAttribute("data-state")).toBe("indeterminate");
    // Ark hides the inactive indicator with the `hidden` attribute; the
    // indeterminate glyph is the visible one.
    const indicators = document.querySelectorAll('[data-scope="checkbox"][data-part="indicator"]');
    expect(indicators).toHaveLength(2);
    expect((indicators[0] as HTMLElement).hidden).toBe(true);
    expect((indicators[1] as HTMLElement).hidden).toBe(false);
  });

  it("marks disabled with data-disabled and refuses to toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Demo disabled onCheckedChange={onCheckedChange} />);

    expect(root().hasAttribute("data-disabled")).toBe(true);
    expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);

    await user.click(screen.getByText("Email me updates"));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(control().getAttribute("data-state")).toBe("unchecked");
  });
});
