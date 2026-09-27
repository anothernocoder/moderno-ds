import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { chartNodeToSvg, sparkChartNodes } from "@moderno-ui/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import { SparkChart } from "../src/spark-chart.js";

const points = [
  { x: 0, y: 10 },
  { x: 1, y: 30 },
  { x: 2, y: 20 },
];

describe("golden-SVG parity (React SparkChart vs charts-core reference)", () => {
  it("the plain line matches the reference serialization", () => {
    expect(normalizeSvg(renderToString(<SparkChart points={points} />))).toBe(
      normalizeSvg(chartNodeToSvg(sparkChartNodes({ points }))),
    );
  });

  it("the filled line with its last point matches the reference serialization", () => {
    const options = { points, width: 200, height: 48, area: true, showLastPoint: true };
    expect(normalizeSvg(renderToString(<SparkChart {...options} />))).toBe(
      normalizeSvg(chartNodeToSvg(sparkChartNodes(options))),
    );
  });
});
