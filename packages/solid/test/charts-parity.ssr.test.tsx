import { describe, expect, it } from "vitest";
import { renderToString } from "solid-js/web";
import {
  areaChartNodes,
  barChartNodes,
  chartNodeToSvg,
  lineChartNodes,
  scatterChartNodes,
} from "@moderno/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import { AreaChart, BarChart, LineChart, ScatterChart } from "../src/charts.jsx";

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

const bar = { width: 200, height: 120, categories: ["a", "b"], series: [{ values: [10, -5] }] };

describe("golden-SVG parity (Solid vs charts-core reference)", () => {
  it("LineChart matches the reference serialization", () => {
    expect(normalizeSvg(renderToString(() => <LineChart {...cartesian} />))).toBe(
      normalizeSvg(chartNodeToSvg(lineChartNodes(cartesian))),
    );
  });

  it("AreaChart matches the reference serialization", () => {
    expect(normalizeSvg(renderToString(() => <AreaChart {...cartesian} />))).toBe(
      normalizeSvg(chartNodeToSvg(areaChartNodes(cartesian))),
    );
  });

  it("BarChart matches the reference serialization", () => {
    expect(normalizeSvg(renderToString(() => <BarChart {...bar} />))).toBe(
      normalizeSvg(chartNodeToSvg(barChartNodes(bar))),
    );
  });

  it("ScatterChart matches the reference serialization", () => {
    expect(normalizeSvg(renderToString(() => <ScatterChart {...cartesian} radius={5} />))).toBe(
      normalizeSvg(chartNodeToSvg(scatterChartNodes({ ...cartesian, radius: 5 }))),
    );
  });
});
