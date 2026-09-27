import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { chartNodeToSvg, donutChartNodes } from "@moderno-ui/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import { DonutChart } from "../src/donut-chart.js";

const donut = {
  width: 200,
  height: 120,
  data: [{ value: 3 }, { value: 0 }, { value: 2 }, { value: 1 }],
};

describe("golden-SVG parity (React DonutChart vs charts-core reference)", () => {
  it("matches the reference serialization with the default ring", () => {
    expect(normalizeSvg(renderToString(<DonutChart {...donut} />))).toBe(
      normalizeSvg(chartNodeToSvg(donutChartNodes(donut))),
    );
  });

  it("matches the reference serialization as a padded pie", () => {
    const pie = { ...donut, innerRadius: 0, padAngle: 0.03 };
    expect(normalizeSvg(renderToString(<DonutChart {...pie} />))).toBe(
      normalizeSvg(chartNodeToSvg(donutChartNodes(pie))),
    );
  });
});
