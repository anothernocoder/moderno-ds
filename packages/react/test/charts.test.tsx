// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { AreaChart, BarChart, LineChart, ScatterChart } from "../src/charts.js";

afterEach(cleanup);

const cartesian = {
  width: 200,
  height: 120,
  xDomain: [0, 10] as const,
  yDomain: [0, 100] as const,
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

describe("LineChart (React)", () => {
  it("renders a themed SVG mapped from the model, with no baked styling", () => {
    const { container } = render(<LineChart {...cartesian} />);
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
    const { container } = render(<LineChart {...cartesian} />);
    expect(container.querySelectorAll('[data-part="grid-line"]').length).toBeGreaterThan(0);
    const labels = container.querySelectorAll('[data-part="tick-label"]');
    expect(labels.length).toBeGreaterThan(0);
  });
});

describe("AreaChart (React)", () => {
  it("renders a filled area plus its top line per series", () => {
    const { container } = render(<AreaChart {...cartesian} />);
    expect(container.querySelectorAll('[data-part="area"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-part="line"]')).toHaveLength(2);
    const area = container.querySelector('[data-part="area"]')!;
    expect(area.getAttribute("d")).toMatch(/Z$/);
  });
});

describe("BarChart (React)", () => {
  it("renders one rect per category per series", () => {
    const { container } = render(
      <BarChart
        width={200}
        height={120}
        categories={["a", "b", "c"]}
        series={[{ values: [10, 20, 30] }]}
      />,
    );
    const bars = container.querySelectorAll('[data-part="bar"]');
    expect(bars).toHaveLength(3);
    expect(bars[0]!.getAttribute("fill")).toBeNull(); // themed via CSS
    expect(bars[0]!.getAttribute("width")).toBeTruthy();
  });
});

describe("ScatterChart (React)", () => {
  it("renders one circle per point", () => {
    const { container } = render(<ScatterChart {...cartesian} radius={5} />);
    const points = container.querySelectorAll('[data-part="point"]');
    expect(points).toHaveLength(4);
    expect(points[0]!.getAttribute("r")).toBe("5");
  });
});

describe("Charts SSR (React)", () => {
  it("server-renders deterministic SVG with the contract attributes", () => {
    const html = renderToString(<LineChart {...cartesian} />);
    expect(html).toContain('data-scope="chart"');
    expect(html).toContain('data-chart="line"');
    expect(html).toContain('data-series="0"');
    // Pure math → byte-identical output across renders (no hydration mismatch).
    expect(renderToString(<LineChart {...cartesian} />)).toBe(html);
  });

  it("server-renders all four chart types", () => {
    expect(renderToString(<AreaChart {...cartesian} />)).toContain('data-chart="area"');
    expect(
      renderToString(
        <BarChart width={200} height={120} categories={["a"]} series={[{ values: [1] }]} />,
      ),
    ).toContain('data-chart="bar"');
    expect(renderToString(<ScatterChart {...cartesian} />)).toContain('data-chart="scatter"');
  });
});
