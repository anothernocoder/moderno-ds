import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/vue";
import { Divider } from "../src/divider.js";

afterEach(cleanup);

describe("Divider (Vue)", () => {
  it("carries scope/part and the recipe defaults", () => {
    const { container } = render(Divider);
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-scope")).toBe("divider");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
    expect(root.getAttribute("data-align")).toBe("center");
  });

  it("maps orientation/align props to data-attributes", () => {
    const { container } = render(Divider, { props: { orientation: "vertical", align: "start" } });
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-orientation")).toBe("vertical");
    expect(root.getAttribute("data-align")).toBe("start");
  });

  it("renders an optional label as its own part", () => {
    render(Divider, { slots: { default: () => "Or" } });
    const label = screen.getByText("Or");
    expect(label.getAttribute("data-scope")).toBe("divider");
    expect(label.getAttribute("data-part")).toBe("label");
  });

  // orientation × label is the cell the docs preview and the SSR playground now
  // both carry: the label part has to survive the vertical orientation, since
  // that is the shape whose gap depends on the label's rotated writing mode.
  it("keeps the label part on a vertical rule", () => {
    const { container } = render(Divider, {
      props: { orientation: "vertical" },
      slots: { default: () => "Or" },
    });
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-orientation")).toBe("vertical");
    const label = screen.getByText("Or");
    expect(label.getAttribute("data-part")).toBe("label");
    expect(label.parentElement).toBe(root);
  });

  it("is a separator when bare, and drops the role when it has a label", () => {
    const bare = render(Divider, { props: { orientation: "vertical" } }).container
      .firstElementChild!;
    expect(bare.getAttribute("role")).toBe("separator");
    expect(bare.getAttribute("aria-orientation")).toBe("vertical");
    cleanup();

    const labelled = render(Divider, { slots: { default: () => "Or" } }).container
      .firstElementChild!;
    expect(labelled.getAttribute("role")).toBeNull();
    expect(labelled.getAttribute("aria-orientation")).toBeNull();
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(Divider);
    const root = container.firstElementChild!;
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native attrs", () => {
    const { container } = render(Divider, { attrs: { class: "mine", "data-testid": "rule" } });
    const root = container.firstElementChild!;
    expect(root.className).toBe("mine");
    expect(root.getAttribute("data-testid")).toBe("rule");
  });
});
