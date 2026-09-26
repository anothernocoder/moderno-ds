import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import ProgressSection from "../../playground/sections/Progress.svelte";

describe("Progress SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(ProgressSection, { props: { open: false } });
    // Progress: Ark's progress machine. The recipe lands on each root, the
    // state reaches the server, the track or the circle is the progressbar
    // with its value, and the percentage is inline on the range; an
    // indeterminate progress has no value and no width.
    expect(partAttrs(html, "progress", "root", "data-size")).toEqual(["md", "sm", "lg"]);
    expect(partAttrs(html, "progress", "root", "data-state")).toEqual([
      "loading",
      "loading",
      "indeterminate",
    ]);
    expect(partAttrs(html, "progress", "track", "role")).toEqual(["progressbar", "progressbar"]);
    expect(partAttrs(html, "progress", "track", "aria-valuenow")).toEqual(["40", undefined]);
    const progressRanges = partAttrs(html, "progress", "range", "style");
    expect(progressRanges[0]).toMatch(/^width:\s*40%;?$/);
    expect(progressRanges[1] ?? "").not.toMatch(/width/);
    expect(partTags(html, "progress", "circle")[0]).toMatch(/^<svg/);
    expect(partAttrs(html, "progress", "circle", "role")).toEqual(["progressbar"]);
    expect(partAttrs(html, "progress", "circle", "aria-valuenow")).toEqual(["75"]);
    expect(partTags(html, "progress", "circle-range")).toHaveLength(1);
    expect(html).toMatch(/data-part="value-text"[^>]*>(?:<!--[^>]*-->)*40%/);
  });
});
