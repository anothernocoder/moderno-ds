// @vitest-environment node
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import ChartsSection from "../../playground/sections/charts.js";
import { renderSection } from "./render-section.js";

describe("Charts SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(ChartsSection);
    // Every chart is drawn on the server: one sized, labelled-as-image SVG per
    // chart type, with its series already plotted.
    expect(partAttrs(html, "chart", "root", "data-chart")).toEqual([
      "line",
      "area",
      "bar",
      "scatter",
    ]);
    expect(partTags(html, "chart", "root").every((tag) => tag.startsWith("<svg"))).toBe(true);
    expect(partAttrs(html, "chart", "root", "viewBox")).toEqual(Array(4).fill("0 0 320 180"));
    expect(partAttrs(html, "chart", "root", "role")).toEqual(Array(4).fill("img"));
    expect(partAttrs(html, "chart", "series", "data-series")).toEqual([
      ...["0", "1"],
      ...["0", "1"],
      ...["0"],
      ...["0", "1"],
    ]);
  });
});
