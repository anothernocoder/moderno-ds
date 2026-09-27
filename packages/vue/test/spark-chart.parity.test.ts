import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { chartNodeToSvg, sparkChartNodes } from "@moderno-ui/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import { SparkChart } from "../src/spark-chart.js";

const points = [
  { x: 0, y: 10 },
  { x: 1, y: 30 },
  { x: 2, y: 20 },
];

function ssr(props: Record<string, unknown>): Promise<string> {
  return renderToString(createSSRApp({ render: () => h(SparkChart, props) }));
}

describe("golden-SVG parity (Vue SparkChart vs charts-core reference)", () => {
  it("the plain line matches the reference serialization", async () => {
    expect(normalizeSvg(await ssr({ points }))).toBe(
      normalizeSvg(chartNodeToSvg(sparkChartNodes({ points }))),
    );
  });

  it("the filled line with its last point matches the reference serialization", async () => {
    const options = { points, width: 200, height: 48, area: true, showLastPoint: true };
    expect(normalizeSvg(await ssr(options))).toBe(
      normalizeSvg(chartNodeToSvg(sparkChartNodes(options))),
    );
  });
});
