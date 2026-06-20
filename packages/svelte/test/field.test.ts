import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/svelte";
import EmailField from "./fixtures/EmailField.svelte";

afterEach(cleanup);

describe("Field (Svelte)", () => {
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
});
