// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Alert } from "../src/alert.js";

afterEach(cleanup);

function Sample(props: { variant?: "info" | "success" | "warning" | "error"; size?: "sm" | "md" }) {
  return (
    <Alert.Root {...props}>
      <Alert.Icon>i</Alert.Icon>
      <Alert.Content>
        <Alert.Title>Trial ending</Alert.Title>
        <Alert.Description>Three days left.</Alert.Description>
        <Alert.Action>
          <button type="button">Manage plan</button>
        </Alert.Action>
      </Alert.Content>
    </Alert.Root>
  );
}

describe("Alert", () => {
  it("carries scope/part and the recipe defaults", () => {
    render(<Sample />);
    const root = screen.getByRole("status");
    expect(root.getAttribute("data-scope")).toBe("alert");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("info");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    render(<Sample variant="warning" size="sm" />);
    const root = screen.getByRole("alert");
    expect(root.getAttribute("data-variant")).toBe("warning");
    expect(root.getAttribute("data-size")).toBe("sm");
  });

  it("renders every part of the anatomy under the alert scope", () => {
    const { container } = render(<Sample />);
    const parts = [...container.querySelectorAll('[data-scope="alert"]')].map((el) =>
      el.getAttribute("data-part"),
    );
    expect(parts).toEqual(["root", "icon", "content", "title", "description", "action"]);
  });

  it("announces urgently only for the urgent statuses", () => {
    const { unmount } = render(<Sample variant="error" />);
    expect(screen.getByRole("alert").textContent).toContain("Trial ending");
    unmount();
    render(<Sample variant="success" />);
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("lets the consumer override the role", () => {
    render(
      <Alert.Root variant="error" role="region" aria-label="billing">
        <Alert.Title>Payment failed</Alert.Title>
      </Alert.Root>,
    );
    expect(screen.getByRole("region", { name: "billing" }).getAttribute("data-variant")).toBe(
      "error",
    );
  });

  it("hides the decorative icon from assistive tech", () => {
    const { container } = render(<Sample />);
    expect(container.querySelector('[data-part="icon"]')!.getAttribute("aria-hidden")).toBe("true");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(<Sample />);
    const root = screen.getByRole("status");
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native props to the parts", () => {
    const { container } = render(
      <Alert.Root id="billing-alert" data-testid="root">
        <Alert.Title className="mine">Payment failed</Alert.Title>
      </Alert.Root>,
    );
    expect(container.querySelector("#billing-alert")!.getAttribute("data-testid")).toBe("root");
    expect(container.querySelector('[data-part="title"]')!.className).toBe("mine");
  });
});
