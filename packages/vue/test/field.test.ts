import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/vue";
import { defineComponent, h, type Component, type PropType } from "vue";
import { Field, type FieldSize } from "../src/field.js";

// Ark-Vue's part components carry ~200-key prop unions; vue-tsc chokes on
// inferring them through deeply nested `h()` trees (TS2590). The cast keeps the
// test trees readable — runtime behaviour is unchanged and asserted below.
const FieldRoot = Field.Root as unknown as Component;

afterEach(cleanup);

const EmailField = defineComponent({
  props: {
    invalid: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<FieldSize>, default: undefined },
  },
  setup(props) {
    return () =>
      h(FieldRoot, { invalid: props.invalid, disabled: props.disabled, size: props.size }, () => [
        h(Field.Label, {}, () => "Email"),
        h(Field.Input, { placeholder: "you@example.com" }),
        h(Field.HelperText, {}, () => "We never share it."),
        h(Field.ErrorText, {}, () => "Email is required."),
      ]);
  },
});

const BioField = defineComponent({
  props: {
    size: { type: String as PropType<FieldSize>, default: undefined },
  },
  setup(props) {
    return () =>
      h(FieldRoot, { size: props.size }, () => [
        h(Field.Label, {}, () => "Bio"),
        h(Field.Textarea, { placeholder: "Tell us about yourself" }),
      ]);
  },
});

describe("Field (Vue)", () => {
  it("associates the label with the control (Ark wires for/id)", () => {
    render(EmailField);
    const input = screen.getByLabelText("Email");
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("data-part")).toBe("input");
  });

  it("emits the field scope/part attributes for the shared stylesheet", () => {
    const { container } = render(EmailField);
    expect(container.querySelector('[data-scope="field"][data-part="root"]')).not.toBeNull();
    expect(container.querySelector('[data-scope="field"][data-part="label"]')).not.toBeNull();
  });

  it("reflects the invalid state onto the control and shows the error text", () => {
    render(EmailField, { props: { invalid: true } });
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("data-invalid")).toBe(true);
    expect(screen.getByText("Email is required.")).toBeTruthy();
  });

  it("hides the error text when valid", () => {
    render(EmailField);
    expect(screen.queryByText("Email is required.")).toBeNull();
    expect(screen.getByText("We never share it.")).toBeTruthy();
  });

  it("propagates the disabled state to the control", () => {
    render(EmailField, { props: { disabled: true } });
    expect((screen.getByLabelText("Email") as HTMLInputElement).disabled).toBe(true);
  });

  it("carries the recipe's default size on the root", () => {
    const { container } = render(EmailField);
    const root = container.querySelector('[data-scope="field"][data-part="root"]');
    expect(root?.getAttribute("data-size")).toBe("md");
  });

  it("maps the size prop onto the root's data-size, not the control", () => {
    const { container } = render(EmailField, { props: { size: "lg" } });
    const root = container.querySelector('[data-scope="field"][data-part="root"]');
    expect(root?.getAttribute("data-size")).toBe("lg");
    // One attribute sizes every part; the control stays a plain Ark part.
    expect(screen.getByLabelText("Email").hasAttribute("data-size")).toBe(false);
  });

  it("renders a textarea control as its own part, under the same size recipe", () => {
    const { container } = render(BioField, { props: { size: "sm" } });
    const textarea = screen.getByLabelText("Bio");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.getAttribute("data-part")).toBe("textarea");
    expect(
      container.querySelector('[data-scope="field"][data-part="root"]')?.getAttribute("data-size"),
    ).toBe("sm");
  });
});
