// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Indicator } from "../src/indicator.js";

afterEach(cleanup);

describe("Indicator", () => {
  it("carries scope/part and the recipe defaults, with no pulse", () => {
    const { container } = render(<Indicator />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-scope")).toBe("indicator");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("neutral");
    expect(root.getAttribute("data-size")).toBe("md");
    expect(root.hasAttribute("data-pulse")).toBe(false);
  });

  it("maps variant/size/pulse props to data-attributes", () => {
    const { container } = render(<Indicator variant="success" size="sm" pulse />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-variant")).toBe("success");
    expect(root.getAttribute("data-size")).toBe("sm");
    expect(root.getAttribute("data-pulse")).toBe("");
  });

  it("always renders the dot, hidden from assistive tech", () => {
    const { container } = render(<Indicator />);
    const dot = container.querySelector('[data-scope="indicator"][data-part="dot"]')!;
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector('[data-part="label"]')).toBeNull();
  });

  it("renders the children as the label part, after the dot", () => {
    const { container } = render(<Indicator variant="success">Online</Indicator>);
    const label = screen.getByText("Online");
    expect(label.getAttribute("data-part")).toBe("label");
    expect(label.previousElementSibling?.getAttribute("data-part")).toBe("dot");
    expect(label.parentElement).toBe(container.firstElementChild);
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(<Indicator pulse />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native props", () => {
    const { container } = render(<Indicator className="mine" aria-label="Online" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe("mine");
    expect(root.getAttribute("aria-label")).toBe("Online");
  });
});
