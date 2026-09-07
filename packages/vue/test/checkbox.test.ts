import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, type Component, type PropType } from "vue";
import { Checkbox, type CheckboxCheckedState } from "../src/index.js";

// See field.test.ts — cast around Ark-Vue's heavy prop unions for the test tree.
const CheckboxRoot = Checkbox.Root as unknown as Component;

afterEach(cleanup);

const Demo = defineComponent({
  props: {
    size: { type: String as PropType<"sm" | "md" | "lg">, default: undefined },
    disabled: { type: Boolean, default: false },
    defaultChecked: { type: [Boolean, String] as PropType<CheckboxCheckedState>, default: false },
    onCheckedChange: { type: Function, default: undefined },
  },
  setup(props) {
    return () =>
      h(
        CheckboxRoot,
        {
          size: props.size,
          disabled: props.disabled,
          defaultChecked: props.defaultChecked,
          onCheckedChange: props.onCheckedChange,
        },
        () => [
          h(Checkbox.Control, {}, () => [
            h(Checkbox.Indicator, {}, () => "✓"),
            h(Checkbox.Indicator, { indeterminate: true }, () => "–"),
          ]),
          h(Checkbox.Label, {}, () => "Email me updates"),
          h(Checkbox.HiddenInput),
        ],
      );
  },
});

const root = () => document.querySelector('[data-scope="checkbox"][data-part="root"]')!;
const control = () => document.querySelector('[data-scope="checkbox"][data-part="control"]')!;

describe("Checkbox (Vue)", () => {
  it("applies the size recipe to the root part, defaulting to md", () => {
    const { container } = render(Demo, { props: { size: "lg" } });
    expect(root().getAttribute("data-size")).toBe("lg");
    expect(container.querySelector('[data-scope="checkbox"][data-part="label"]')).not.toBeNull();
    expect(container.querySelector('[data-scope="checkbox"][data-part="control"]')).not.toBeNull();

    cleanup();
    render(Demo);
    expect(root().getAttribute("data-size")).toBe("md");
  });

  it("binds the label to a hidden native input so forms and a11y work", () => {
    render(Demo);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.type).toBe("checkbox");
    expect(root().getAttribute("for")).toBe(input.id);
    expect(input.checked).toBe(false);
    expect(control().getAttribute("data-state")).toBe("unchecked");
  });

  it("toggles on click and reports the new checked state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(Demo, { props: { onCheckedChange } });

    await user.click(screen.getByText("Email me updates"));

    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
    expect(control().getAttribute("data-state")).toBe("checked");
  });

  it("renders the indeterminate state with its own data-state and indicator", () => {
    render(Demo, { props: { defaultChecked: "indeterminate" } });
    expect(control().getAttribute("data-state")).toBe("indeterminate");
    const indicators = document.querySelectorAll('[data-scope="checkbox"][data-part="indicator"]');
    expect(indicators).toHaveLength(2);
    expect((indicators[0] as HTMLElement).hidden).toBe(true);
    expect((indicators[1] as HTMLElement).hidden).toBe(false);
  });

  it("marks disabled with data-disabled and refuses to toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(Demo, { props: { disabled: true, onCheckedChange } });

    expect(root().hasAttribute("data-disabled")).toBe(true);
    expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);

    await user.click(screen.getByText("Email me updates"));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(control().getAttribute("data-state")).toBe("unchecked");
  });
});
