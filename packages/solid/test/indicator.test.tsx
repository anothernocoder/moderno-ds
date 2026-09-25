import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@solidjs/testing-library";
import { Indicator } from "../src/indicator.jsx";

afterEach(cleanup);

describe("Indicator (Solid)", () => {
  it("carries scope/part and the recipe defaults, with no pulse", () => {
    const { container } = render(() => <Indicator />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-scope")).toBe("indicator");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("neutral");
    expect(root.getAttribute("data-size")).toBe("md");
    expect(root.hasAttribute("data-pulse")).toBe(false);
  });

  it("maps variant/size/pulse props to data-attributes", () => {
    const { container } = render(() => <Indicator variant="success" size="sm" pulse />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-variant")).toBe("success");
    expect(root.getAttribute("data-size")).toBe("sm");
    expect(root.getAttribute("data-pulse")).toBe("");
  });

  it("always renders the dot, hidden from assistive tech", () => {
    const { container } = render(() => <Indicator />);
    const dot = container.querySelector('[data-scope="indicator"][data-part="dot"]')!;
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector('[data-part="label"]')).toBeNull();
  });

  it("renders the children as the label part, after the dot", () => {
    const { container } = render(() => <Indicator variant="success">Online</Indicator>);
    const label = screen.getByText("Online");
    expect(label.getAttribute("data-part")).toBe("label");
    expect(label.previousElementSibling?.getAttribute("data-part")).toBe("dot");
    expect(label.parentElement).toBe(container.firstElementChild);
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(() => <Indicator pulse />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native props", () => {
    const { container } = render(() => <Indicator class="mine" aria-label="Online" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe("mine");
    expect(root.getAttribute("aria-label")).toBe("Online");
  });

  it("names a bare dot through role=img, so a screen reader reads its status", () => {
    render(() => <Indicator variant="error" aria-label="Offline" />);
    const root = screen.getByRole("img", { name: "Offline" });
    expect(root.getAttribute("data-part")).toBe("root");
  });

  it("gives no role to a labelled indicator or an unnamed dot", () => {
    const { container } = render(() => (
      <>
        <Indicator aria-label="Status">Online</Indicator>
        <Indicator />
      </>
    ));
    for (const root of container.querySelectorAll('[data-part="root"]')) {
      expect(root.hasAttribute("role")).toBe(false);
    }
  });

  it("lets a consumer role win", () => {
    render(() => <Indicator role="status" aria-label="Offline" />);
    expect(screen.getByRole("status", { name: "Offline" })).toBeTruthy();
  });
});
