import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/svelte";
import Divider from "./fixtures/DividerFixture.svelte";

afterEach(cleanup);

/** The fixture wraps the primitive, so the divider root is the first element. */
function root(container: HTMLElement): Element {
  return container.querySelector('[data-scope="divider"][data-part="root"]')!;
}

describe("Divider (Svelte)", () => {
  it("carries scope/part and the recipe defaults", () => {
    const { container } = render(Divider);
    expect(root(container).getAttribute("data-orientation")).toBe("horizontal");
    expect(root(container).getAttribute("data-align")).toBe("center");
  });

  it("maps orientation/align props to data-attributes", () => {
    const { container } = render(Divider, { props: { orientation: "vertical", align: "start" } });
    expect(root(container).getAttribute("data-orientation")).toBe("vertical");
    expect(root(container).getAttribute("data-align")).toBe("start");
  });

  it("renders an optional label as its own part", () => {
    render(Divider, { props: { label: "Or" } });
    const label = screen.getByText("Or");
    expect(label.getAttribute("data-scope")).toBe("divider");
    expect(label.getAttribute("data-part")).toBe("label");
  });

  // orientation × label is the cell the docs preview and the SSR playground now
  // both carry: the label part has to survive the vertical orientation, since
  // that is the shape whose gap depends on the label's rotated writing mode.
  it("keeps the label part on a vertical rule", () => {
    const { container } = render(Divider, { props: { orientation: "vertical", label: "Or" } });
    expect(root(container).getAttribute("data-orientation")).toBe("vertical");
    const label = screen.getByText("Or");
    expect(label.getAttribute("data-part")).toBe("label");
    expect(label.parentElement).toBe(root(container));
  });

  it("is a separator when bare, and drops the role when it has a label", () => {
    const bare = render(Divider, { props: { orientation: "vertical" } });
    expect(root(bare.container).getAttribute("role")).toBe("separator");
    expect(root(bare.container).getAttribute("aria-orientation")).toBe("vertical");
    cleanup();

    const labelled = render(Divider, { props: { label: "Or" } });
    expect(root(labelled.container).getAttribute("role")).toBeNull();
    expect(root(labelled.container).getAttribute("aria-orientation")).toBeNull();
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(Divider);
    expect(root(container).getAttribute("style")).toBeNull();
    expect(root(container).className).toBe("");
  });

  it("forwards native props", () => {
    const { container } = render(Divider, { props: { class: "mine", "data-testid": "rule" } });
    expect(root(container).className).toBe("mine");
    expect(root(container).getAttribute("data-testid")).toBe("rule");
  });
});
