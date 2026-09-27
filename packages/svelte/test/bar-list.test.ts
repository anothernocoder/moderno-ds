import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { BarList } from "../src/index.js";

afterEach(cleanup);

const list = {
  width: 300,
  data: [
    { name: "/pricing", value: 50 },
    { name: "/", value: 100 },
  ],
};

describe("BarList (Svelte)", () => {
  it("renders the rows from the render tree, with no baked styling", () => {
    const { container } = render(BarList, { props: list });
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("data-scope")).toBe("chart");
    expect(svg.getAttribute("data-chart")).toBe("bar-list");
    expect(svg.getAttribute("viewBox")).toBe("0 0 300 64");

    const labels = [...svg.querySelectorAll('[data-part="label"]')].map((n) => n.textContent);
    expect(labels).toEqual(["/", "/pricing"]);
    const bar = svg.querySelector('[data-part="bar"]')!;
    expect(bar.getAttribute("width")).toBe("116");
    for (const part of ["track", "bar", "label", "value"]) {
      const node = svg.querySelector(`[data-part="${part}"]`)!;
      expect(node.getAttribute("style"), part).toBeNull();
      expect(node.getAttribute("fill"), part).toBeNull();
    }
  });

  it("passes the list options through to the render tree", () => {
    const { container } = render(BarList, {
      props: { ...list, sort: "none", max: 200, format: (v: number) => `${v}%` },
    });
    const values = [...container.querySelectorAll('[data-part="value"]')].map((n) => n.textContent);
    expect(values).toEqual(["50%", "100%"]);
    const bars = [...container.querySelectorAll('[data-part="bar"]')];
    expect(bars.map((n) => n.getAttribute("width"))).toEqual(["29", "58"]);
  });

  it("forwards consumer attributes but never lets them clobber the contract", () => {
    const { container } = render(BarList, {
      props: { ...list, "aria-label": "Top pages", class: "ranking", "data-part": "custom" },
    });
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-label")).toBe("Top pages");
    expect(svg.getAttribute("class")).toBe("ranking");
    expect(svg.getAttribute("data-part")).toBe("root");
  });
});
