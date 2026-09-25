import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/vue";
import { Skeleton } from "../src/skeleton.js";

afterEach(cleanup);

describe("Skeleton (Vue)", () => {
  it("carries scope/part and the recipe default", () => {
    render(Skeleton, { attrs: { "data-testid": "skeleton" } });
    const root = screen.getByTestId("skeleton");
    expect(root.tagName).toBe("SPAN");
    expect(root.getAttribute("data-scope")).toBe("skeleton");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-shape")).toBe("text");
    expect(root.childNodes).toHaveLength(0);
  });

  it("maps shape to data-shape", () => {
    render(Skeleton, { props: { shape: "circle" }, attrs: { "data-testid": "skeleton" } });
    expect(screen.getByTestId("skeleton").getAttribute("data-shape")).toBe("circle");
  });

  it("is hidden from assistive tech unless the consumer says otherwise", () => {
    render(Skeleton, { attrs: { "data-testid": "skeleton" } });
    expect(screen.getByTestId("skeleton").getAttribute("aria-hidden")).toBe("true");
    cleanup();

    render(Skeleton, { attrs: { "data-testid": "skeleton", "aria-hidden": "false" } });
    expect(screen.getByTestId("skeleton").getAttribute("aria-hidden")).toBe("false");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(Skeleton, { props: { shape: "rect" }, attrs: { "data-testid": "skeleton" } });
    const root = screen.getByTestId("skeleton");
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native attrs, including a size through style", () => {
    render(Skeleton, {
      attrs: { class: "mine", "data-testid": "skeleton", style: "width: 60%" },
    });
    const root = screen.getByTestId("skeleton");
    expect(root.className).toBe("mine");
    expect(root.style.width).toBe("60%");
  });
});
