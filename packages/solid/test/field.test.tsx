import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@solidjs/testing-library";
import { Field, type FieldSize } from "../src/field.jsx";

afterEach(cleanup);

function EmailField(props: { invalid?: boolean; disabled?: boolean; size?: FieldSize }) {
  return (
    <Field.Root invalid={props.invalid} disabled={props.disabled} size={props.size}>
      <Field.Label>Email</Field.Label>
      <Field.Input placeholder="you@example.com" />
      <Field.HelperText>We never share it.</Field.HelperText>
      <Field.ErrorText>Email is required.</Field.ErrorText>
    </Field.Root>
  );
}

function BioField(props: { size?: FieldSize }) {
  return (
    <Field.Root size={props.size}>
      <Field.Label>Bio</Field.Label>
      <Field.Textarea placeholder="Tell us about yourself" />
    </Field.Root>
  );
}

describe("Field (Solid)", () => {
  it("associates the label with the control (Ark wires for/id)", () => {
    render(() => <EmailField />);
    const input = screen.getByLabelText("Email");
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("data-part")).toBe("input");
  });

  it("emits the field scope/part attributes for the shared stylesheet", () => {
    const { container } = render(() => <EmailField />);
    expect(container.querySelector('[data-scope="field"][data-part="root"]')).not.toBeNull();
    expect(container.querySelector('[data-scope="field"][data-part="label"]')).not.toBeNull();
  });

  it("reflects the invalid state onto the control and shows the error text", () => {
    render(() => <EmailField invalid />);
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("data-invalid")).toBe(true);
    expect(screen.getByText("Email is required.")).toBeTruthy();
  });

  it("hides the error text when valid", () => {
    render(() => <EmailField />);
    expect(screen.queryByText("Email is required.")).toBeNull();
    expect(screen.getByText("We never share it.")).toBeTruthy();
  });

  it("propagates the disabled state to the control", () => {
    render(() => <EmailField disabled />);
    expect((screen.getByLabelText("Email") as HTMLInputElement).disabled).toBe(true);
  });

  it("carries the recipe's default size on the root", () => {
    const { container } = render(() => <EmailField />);
    const root = container.querySelector('[data-scope="field"][data-part="root"]');
    expect(root?.getAttribute("data-size")).toBe("md");
  });

  it("maps the size prop onto the root's data-size, not the control", () => {
    const { container } = render(() => <EmailField size="lg" />);
    const root = container.querySelector('[data-scope="field"][data-part="root"]');
    expect(root?.getAttribute("data-size")).toBe("lg");
    // One attribute sizes every part; the control stays a plain Ark part.
    expect(screen.getByLabelText("Email").hasAttribute("data-size")).toBe(false);
  });

  it("renders a textarea control as its own part, under the same size recipe", () => {
    const { container } = render(() => <BioField size="sm" />);
    const textarea = screen.getByLabelText("Bio");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.getAttribute("data-part")).toBe("textarea");
    expect(
      container.querySelector('[data-scope="field"][data-part="root"]')?.getAttribute("data-size"),
    ).toBe("sm");
  });
});
