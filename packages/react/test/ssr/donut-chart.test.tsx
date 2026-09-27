import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import DonutChartSection from "../../playground/sections/donut-chart.js";

describe("DonutChart SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<DonutChartSection open={false} />);
    // Both rings are drawn on the server as labelled-as-image SVGs, one slice
    // per positive share; the zero share draws nothing and the slices after it
    // keep their own index (and so their colour).
    expect(partAttrs(html, "chart", "root", "data-chart")).toEqual(["donut", "donut"]);
    expect(partAttrs(html, "chart", "root", "viewBox")).toEqual(Array(2).fill("0 0 180 180"));
    expect(partAttrs(html, "chart", "root", "role")).toEqual(["img", "img"]);
    expect(partAttrs(html, "chart", "root", "aria-label")).toEqual([
      "Traffic by source",
      undefined,
    ]);
    expect(partAttrs(html, "chart", "series", "data-series")).toEqual([
      ...["0", "1", "2"],
      ...["0", "2", "3"],
    ]);
    expect(partTags(html, "chart", "slice").every((tag) => tag.startsWith("<path"))).toBe(true);
    expect(partTags(html, "chart", "slice")).toHaveLength(6);
  });
});
