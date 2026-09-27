import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { chartNodeToSvg, sparkChartNodes } from "@moderno-ui/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import SparkChart from "../src/SparkChart.svelte";

const points = [
  { x: 0, y: 10 },
  { x: 1, y: 30 },
  { x: 2, y: 20 },
];

describe("golden-SVG parity (Svelte SparkChart vs charts-core reference)", () => {
  it("the plain line matches the reference serialization", () => {
    expect(normalizeSvg(render(SparkChart, { props: { points } }).html)).toBe(
      normalizeSvg(chartNodeToSvg(sparkChartNodes({ points }))),
    );
  });

  it("the filled line with its last point matches the reference serialization", () => {
    const options = { points, width: 200, height: 48, area: true, showLastPoint: true };
    expect(normalizeSvg(render(SparkChart, { props: options }).html)).toBe(
      normalizeSvg(chartNodeToSvg(sparkChartNodes(options))),
    );
  });
});
