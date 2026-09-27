import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import BarListSection from "../../playground/sections/BarList.svelte";

describe("BarList SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(BarListSection, { props: { open: false } });
    // The whole list is drawn on the server: one image-role SVG as tall as its
    // rows, one series, and every row sorted largest first.
    expect(partAttrs(html, "chart", "root", "data-chart")).toEqual(["bar-list"]);
    expect(partTags(html, "chart", "root")[0]).toMatch(/^<svg/);
    expect(partAttrs(html, "chart", "root", "viewBox")).toEqual(["0 0 320 128"]);
    expect(partAttrs(html, "chart", "root", "role")).toEqual(["img"]);
    expect(partAttrs(html, "chart", "root", "aria-label")).toEqual(["Visits by page"]);
    expect(partAttrs(html, "chart", "series", "data-series")).toEqual(["0"]);
    expect(partTags(html, "chart", "row")).toHaveLength(4);
    expect(partAttrs(html, "chart", "bar", "width")).toEqual(["136", "94.32", "59.23", "35.1"]);
    expect(html).toContain(">/</text>");
    expect(html).toContain(">1240</text>");
  });
});
