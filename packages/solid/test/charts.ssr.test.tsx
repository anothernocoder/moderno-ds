import { describe, expect, it } from "vitest";
import { renderToString } from "solid-js/web";
import { AreaChart, BarChart, LineChart, ScatterChart } from "../src/charts.jsx";

/**
 * Charts SSR smoke — Solid compiles this file in server mode (see
 * vitest.ssr.config.ts), so `solid-js/web`'s `renderToString` is the real
 * isomorphic renderer. Chart geometry is pure math, so the same model serialises
 * byte-identically across renders (no hydration mismatch), and every chart type
 * emits its `data-chart` value.
 */

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

describe("Charts SSR (Solid)", () => {
  it("server-renders deterministic SVG with the contract attributes", () => {
    const html = renderToString(() => <LineChart {...cartesian} />);
    expect(html).toContain('data-scope="chart"');
    expect(html).toContain('data-chart="line"');
    expect(html).toContain('data-series="0"');
    // Pure math → byte-identical output across renders.
    expect(renderToString(() => <LineChart {...cartesian} />)).toBe(html);
  });

  it("server-renders all four chart types", () => {
    expect(renderToString(() => <AreaChart {...cartesian} />)).toContain('data-chart="area"');
    expect(
      renderToString(() => (
        <BarChart width={200} height={120} categories={["a"]} series={[{ values: [1] }]} />
      )),
    ).toContain('data-chart="bar"');
    expect(renderToString(() => <ScatterChart {...cartesian} />)).toContain('data-chart="scatter"');
  });
});
