import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import SparkChartSection from "../../playground/sections/SparkChart.svelte";

describe("SparkChart SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(SparkChartSection, { props: { open: false } });
    // Both sparks are drawn on the server: a labelled image SVG with its one series plotted, the
    // fill and the last-point marker only where asked.
    expect(partAttrs(html, "chart", "root", "data-chart")).toEqual(["spark", "spark"]);
    expect(partTags(html, "chart", "root").every((tag) => tag.startsWith("<svg"))).toBe(true);
    expect(partAttrs(html, "chart", "root", "viewBox")).toEqual(["0 0 120 32", "0 0 120 32"]);
    expect(partAttrs(html, "chart", "root", "aria-label")).toEqual([
      "Visits, last 6 days",
      "Visits, with today marked",
    ]);
    expect(partAttrs(html, "chart", "series", "data-series")).toEqual(["0", "0"]);
    expect(partTags(html, "chart", "line")).toHaveLength(2);
    expect(partTags(html, "chart", "area")).toHaveLength(1);
    expect(partAttrs(html, "chart", "point", "r")).toEqual(["3"]);
  });
});
