import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import {
  areaChartNodes,
  barChartNodes,
  chartNodeToSvg,
  lineChartNodes,
  scatterChartNodes,
} from "@moderno/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import AreaChart from "../src/AreaChart.svelte";
import BarChart from "../src/BarChart.svelte";
import LineChart from "../src/LineChart.svelte";
import ScatterChart from "../src/ScatterChart.svelte";

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

const bar = { width: 200, height: 120, categories: ["a", "b"], series: [{ values: [10, -5] }] };

describe("golden-SVG parity (Svelte vs charts-core reference)", () => {
  it("LineChart matches the reference serialization", () => {
    expect(normalizeSvg(render(LineChart, { props: cartesian }).html)).toBe(
      normalizeSvg(chartNodeToSvg(lineChartNodes(cartesian))),
    );
  });

  it("AreaChart matches the reference serialization", () => {
    expect(normalizeSvg(render(AreaChart, { props: cartesian }).html)).toBe(
      normalizeSvg(chartNodeToSvg(areaChartNodes(cartesian))),
    );
  });

  it("BarChart matches the reference serialization", () => {
    expect(normalizeSvg(render(BarChart, { props: bar }).html)).toBe(
      normalizeSvg(chartNodeToSvg(barChartNodes(bar))),
    );
  });

  it("ScatterChart matches the reference serialization", () => {
    expect(normalizeSvg(render(ScatterChart, { props: { ...cartesian, radius: 5 } }).html)).toBe(
      normalizeSvg(chartNodeToSvg(scatterChartNodes({ ...cartesian, radius: 5 }))),
    );
  });
});
