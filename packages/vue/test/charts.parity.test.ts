import { describe, expect, it } from "vitest";
import { createSSRApp, h, type Component } from "vue";
import { renderToString } from "@vue/server-renderer";
import {
  areaChartNodes,
  barChartNodes,
  chartNodeToSvg,
  lineChartNodes,
  scatterChartNodes,
} from "@moderno/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import { AreaChart, BarChart, LineChart, ScatterChart } from "../src/charts.js";

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

function ssr(component: Component, props: Record<string, unknown>): Promise<string> {
  return renderToString(createSSRApp({ render: () => h(component, props) }));
}

describe("golden-SVG parity (Vue vs charts-core reference)", () => {
  it("LineChart matches the reference serialization", async () => {
    expect(normalizeSvg(await ssr(LineChart, cartesian))).toBe(
      normalizeSvg(chartNodeToSvg(lineChartNodes(cartesian))),
    );
  });

  it("AreaChart matches the reference serialization", async () => {
    expect(normalizeSvg(await ssr(AreaChart, cartesian))).toBe(
      normalizeSvg(chartNodeToSvg(areaChartNodes(cartesian))),
    );
  });

  it("BarChart matches the reference serialization", async () => {
    expect(normalizeSvg(await ssr(BarChart, bar))).toBe(
      normalizeSvg(chartNodeToSvg(barChartNodes(bar))),
    );
  });

  it("ScatterChart matches the reference serialization", async () => {
    expect(normalizeSvg(await ssr(ScatterChart, { ...cartesian, radius: 5 }))).toBe(
      normalizeSvg(chartNodeToSvg(scatterChartNodes({ ...cartesian, radius: 5 }))),
    );
  });
});
