import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/vue";
import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { barListNodes, chartNodeToSvg } from "@moderno-ui/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import { BarList } from "../src/bar-list.js";

afterEach(cleanup);

const list = {
  width: 300,
  data: [
    { name: "/pricing", value: 50 },
    { name: "/", value: 100 },
  ],
};

describe("BarList (Vue)", () => {
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
      props: list,
      attrs: { "aria-label": "Top pages", class: "ranking", "data-part": "custom" },
    });
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-label")).toBe("Top pages");
    expect(svg.getAttribute("class")).toBe("ranking");
    expect(svg.getAttribute("data-part")).toBe("root");
  });
});

describe("golden-SVG parity (Vue vs charts-core reference)", () => {
  it("BarList matches the reference serialization", async () => {
    const options = { ...list, labelWidth: 80, rowHeight: 28, barHeight: 6 };
    const html = await renderToString(createSSRApp({ render: () => h(BarList, options) }));
    expect(normalizeSvg(html)).toBe(normalizeSvg(chartNodeToSvg(barListNodes(options))));
  });
});
