import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { chartNodeToSvg, donutChartNodes, type DonutChartOptions } from "@moderno-ui/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import { DonutChart } from "../src/donut-chart.js";

const donut = {
  width: 200,
  height: 120,
  data: [{ value: 3 }, { value: 0 }, { value: 2 }, { value: 1 }],
};

function ssr(props: DonutChartOptions): Promise<string> {
  return renderToString(createSSRApp({ render: () => h(DonutChart, { ...props }) }));
}

describe("golden-SVG parity (Vue DonutChart vs charts-core reference)", () => {
  it("matches the reference serialization with the default ring", async () => {
    expect(normalizeSvg(await ssr(donut))).toBe(
      normalizeSvg(chartNodeToSvg(donutChartNodes(donut))),
    );
  });

  it("matches the reference serialization as a padded pie", async () => {
    const pie = { ...donut, innerRadius: 0, padAngle: 0.03 };
    expect(normalizeSvg(await ssr(pie))).toBe(normalizeSvg(chartNodeToSvg(donutChartNodes(pie))));
  });
});
