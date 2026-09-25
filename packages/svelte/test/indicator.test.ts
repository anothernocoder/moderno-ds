import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/svelte";
import Indicator from "./fixtures/IndicatorFixture.svelte";

afterEach(cleanup);

/** The fixture wraps the primitive, so the indicator root is found by its part. */
function root(container: HTMLElement): Element {
  return container.querySelector('[data-scope="indicator"][data-part="root"]')!;
}

describe("Indicator (Svelte)", () => {
  it("carries scope/part and the recipe defaults, with no pulse", () => {
    const { container } = render(Indicator);
    expect(root(container).getAttribute("data-variant")).toBe("neutral");
    expect(root(container).getAttribute("data-size")).toBe("md");
    expect(root(container).hasAttribute("data-pulse")).toBe(false);
  });

  it("maps variant/size/pulse props to data-attributes", () => {
    const { container } = render(Indicator, {
      props: { variant: "success", size: "sm", pulse: true },
    });
    expect(root(container).getAttribute("data-variant")).toBe("success");
    expect(root(container).getAttribute("data-size")).toBe("sm");
    expect(root(container).getAttribute("data-pulse")).toBe("");
  });

  it("always renders the dot, hidden from assistive tech", () => {
    const { container } = render(Indicator);
    const dot = container.querySelector('[data-scope="indicator"][data-part="dot"]')!;
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector('[data-part="label"]')).toBeNull();
  });

  it("renders the children as the label part, after the dot", () => {
    const { container } = render(Indicator, { props: { variant: "success", label: "Online" } });
    const label = screen.getByText("Online");
    expect(label.getAttribute("data-part")).toBe("label");
    expect(label.previousElementSibling?.getAttribute("data-part")).toBe("dot");
    expect(label.parentElement).toBe(root(container));
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(Indicator, { props: { pulse: true } });
    expect(root(container).getAttribute("style")).toBeNull();
    expect(root(container).className).toBe("");
  });

  it("forwards native props", () => {
    const { container } = render(Indicator, { props: { class: "mine", "aria-label": "Online" } });
    expect(root(container).className).toBe("mine");
    expect(root(container).getAttribute("aria-label")).toBe("Online");
  });
});
