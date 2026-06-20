import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/vue";
import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { AreaChart, BarChart, LineChart, ScatterChart } from "../src/charts.js";

afterEach(cleanup);

const cartesian = {
  width: 200,
  height: 120,
  xDomain: [0, 10] as [number, number],
  yDomain: [0, 100] as [number, number],
  series: [
    {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 100 },
      ],
    },
    {
      points: [
        { x: 0, y: 50 },
        { x: 10, y: 25 },
      ],
    },
  ],
};

describe("LineChart (Vue)", () => {
  it("renders a themed SVG mapped from the model, with no baked styling", () => {
    const { container } = render(LineChart, { props: cartesian });
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("data-scope")).toBe("chart");
    expect(svg.getAttribute("data-chart")).toBe("line");
    expect(svg.getAttribute("viewBox")).toBe("0 0 200 120");

    const series = svg.querySelectorAll('[data-part="series"]');
    expect(series).toHaveLength(2);
    expect(series[0]!.getAttribute("data-series")).toBe("0");
    expect(series[1]!.getAttribute("data-series")).toBe("1");

    const line = svg.querySelector('[data-part="line"]')!;
    // Path geometry comes straight from charts-core; the component adds none.
    expect(line.getAttribute("d")).toMatch(/^M/);
    // Zero baked colour/style — theming is entirely via components.css.
    expect(line.getAttribute("style")).toBeNull();
    expect(line.getAttribute("fill")).toBeNull();
    expect(line.getAttribute("stroke")).toBeNull();
    expect(svg.getAttribute("class")).toBeNull();
  });

  it("renders grid + axis labels from the model", () => {
    const { container } = render(LineChart, { props: cartesian });
    expect(container.querySelectorAll('[data-part="grid-line"]').length).toBeGreaterThan(0);
    const labels = container.querySelectorAll('[data-part="tick-label"]');
    expect(labels.length).toBeGreaterThan(0);
  });
});

describe("AreaChart (Vue)", () => {
  it("renders a filled area plus its top line per series", () => {
    const { container } = render(AreaChart, { props: cartesian });
    expect(container.querySelectorAll('[data-part="area"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-part="line"]')).toHaveLength(2);
    const area = container.querySelector('[data-part="area"]')!;
    expect(area.getAttribute("d")).toMatch(/Z$/);
  });
});

describe("BarChart (Vue)", () => {
  it("renders one rect per category per series", () => {
    const { container } = render(BarChart, {
      props: {
        width: 200,
        height: 120,
        categories: ["a", "b", "c"],
        series: [{ values: [10, 20, 30] }],
      },
    });
    const bars = container.querySelectorAll('[data-part="bar"]');
    expect(bars).toHaveLength(3);
    expect(bars[0]!.getAttribute("fill")).toBeNull(); // themed via CSS
    expect(bars[0]!.getAttribute("width")).toBeTruthy();
  });
});

describe("ScatterChart (Vue)", () => {
  it("renders one circle per point", () => {
    const { container } = render(ScatterChart, { props: { ...cartesian, radius: 5 } });
    const points = container.querySelectorAll('[data-part="point"]');
    expect(points).toHaveLength(4);
    expect(points[0]!.getAttribute("r")).toBe("5");
  });
});

describe("Charts SSR (Vue)", () => {
  it("server-renders deterministic SVG with the contract attributes", async () => {
    const html = await renderToString(createSSRApp({ render: () => h(LineChart, cartesian) }));
    expect(html).toContain('data-scope="chart"');
    expect(html).toContain('data-chart="line"');
    expect(html).toContain('data-series="0"');
    // Pure math → byte-identical output across renders (no hydration mismatch).
    const again = await renderToString(createSSRApp({ render: () => h(LineChart, cartesian) }));
    expect(again).toBe(html);
  });

  it("server-renders all four chart types", async () => {
    const area = await renderToString(createSSRApp({ render: () => h(AreaChart, cartesian) }));
    expect(area).toContain('data-chart="area"');

    const bar = await renderToString(
      createSSRApp({
        render: () =>
          h(BarChart, { width: 200, height: 120, categories: ["a"], series: [{ values: [1] }] }),
      }),
    );
    expect(bar).toContain('data-chart="bar"');

    const scatter = await renderToString(
      createSSRApp({ render: () => h(ScatterChart, cartesian) }),
    );
    expect(scatter).toContain('data-chart="scatter"');
  });
});
