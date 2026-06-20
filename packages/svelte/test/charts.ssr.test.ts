import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import AreaChart from "../src/AreaChart.svelte";
import BarChart from "../src/BarChart.svelte";
import LineChart from "../src/LineChart.svelte";
import ScatterChart from "../src/ScatterChart.svelte";

/**
 * SSR — the F4.4 guarantee. `svelte/server`'s `render()` compiles and renders
 * each chart to a static HTML string in Node with no browser and no client
 * runtime, exactly as an Astro server-only island would. Because the model is
 * pure math, the output is byte-identical across renders (no hydration drift).
 */
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

describe("Charts SSR (Svelte, server-only island)", () => {
  it("server-renders deterministic SVG with the contract attributes", () => {
    const { html } = render(LineChart, { props: cartesian });
    expect(html).toContain('data-scope="chart"');
    expect(html).toContain('data-chart="line"');
    expect(html).toContain('data-series="0"');
    // Pure math → byte-identical output across renders.
    expect(render(LineChart, { props: cartesian }).html).toBe(html);
  });

  it("server-renders all four chart types with their data-chart value", () => {
    expect(render(LineChart, { props: cartesian }).html).toContain('data-chart="line"');
    expect(render(AreaChart, { props: cartesian }).html).toContain('data-chart="area"');
    expect(
      render(BarChart, {
        props: { width: 200, height: 120, categories: ["a"], series: [{ values: [1] }] },
      }).html,
    ).toContain('data-chart="bar"');
    expect(render(ScatterChart, { props: cartesian }).html).toContain('data-chart="scatter"');
  });

  it("emits static markup with no client runtime (zero <script>)", () => {
    const { html } = render(AreaChart, { props: cartesian });
    expect(html).not.toContain("<script");
  });
});
