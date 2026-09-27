import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { chartNodeToSvg, donutChartNodes } from "@moderno-ui/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import DonutChart from "../src/DonutChart.svelte";

const donut = {
  width: 200,
  height: 120,
  data: [{ value: 3 }, { value: 0 }, { value: 2 }, { value: 1 }],
};

describe("golden-SVG parity (Svelte DonutChart vs charts-core reference)", () => {
  it("matches the reference serialization with the default ring", () => {
    expect(normalizeSvg(render(DonutChart, { props: donut }).html)).toBe(
      normalizeSvg(chartNodeToSvg(donutChartNodes(donut))),
    );
  });

  it("matches the reference serialization as a padded pie", () => {
    const pie = { ...donut, innerRadius: 0, padAngle: 0.03 };
    expect(normalizeSvg(render(DonutChart, { props: pie }).html)).toBe(
      normalizeSvg(chartNodeToSvg(donutChartNodes(pie))),
    );
  });
});
