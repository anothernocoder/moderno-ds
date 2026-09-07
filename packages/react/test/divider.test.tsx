// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Divider } from "../src/divider.js";

afterEach(cleanup);

describe("Divider", () => {
  it("carries scope/part and the recipe defaults", () => {
    const { container } = render(<Divider />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-scope")).toBe("divider");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
    expect(root.getAttribute("data-align")).toBe("center");
  });

  it("maps orientation/align props to data-attributes", () => {
    const { container } = render(<Divider orientation="vertical" align="start" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-orientation")).toBe("vertical");
    expect(root.getAttribute("data-align")).toBe("start");
  });

  it("renders an optional label as its own part", () => {
    render(<Divider>Or</Divider>);
    const label = screen.getByText("Or");
    expect(label.getAttribute("data-scope")).toBe("divider");
    expect(label.getAttribute("data-part")).toBe("label");
  });

  it("is a separator when bare, and drops the role when it has a label", () => {
    // role=separator makes children presentational, which would hide the label
    // from assistive tech — so a captioned divider is a plain container.
    const { container, rerender } = render(<Divider orientation="vertical" />);
    const bare = container.firstElementChild!;
    expect(bare.getAttribute("role")).toBe("separator");
    expect(bare.getAttribute("aria-orientation")).toBe("vertical");

    rerender(<Divider>Or</Divider>);
    const labelled = container.firstElementChild!;
    expect(labelled.getAttribute("role")).toBeNull();
    expect(labelled.getAttribute("aria-orientation")).toBeNull();
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(<Divider />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native props", () => {
    const { container } = render(<Divider className="mine" data-testid="rule" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe("mine");
    expect(root.getAttribute("data-testid")).toBe("rule");
  });
});
