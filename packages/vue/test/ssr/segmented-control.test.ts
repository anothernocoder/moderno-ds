// @vitest-environment node
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import SegmentedControlSection from "../../playground/sections/segmented-control.js";
import { renderSection } from "./render-section.js";

/** Whether an open tag carries a bare boolean attribute. */
const has = (name: string) => (tag: string) => new RegExp(`\\s${name}(?:=""|[\\s>/])`).test(tag);

describe("SegmentedControl SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(SegmentedControlSection);
    // The recipe lands on each root with the segments in a row, the checked
    // segment reaches its parts on the server, the disabled control and
    // segment are marked, the indicator stays hidden until the client
    // measures, and every native radio is already there with its checked /
    // disabled state before hydration.
    const roots = partTags(html, "segment-group", "root");
    expect(partAttrs(html, "segment-group", "root", "data-size")).toEqual(["md", "sm"]);
    expect(roots.map(has("data-full-width"))).toEqual([false, true]);
    expect(roots.map(has("data-disabled"))).toEqual([false, true]);
    expect(partAttrs(html, "segment-group", "root", "role")).toEqual(["radiogroup", "radiogroup"]);
    expect(partAttrs(html, "segment-group", "root", "aria-label")).toEqual(["Scale", "Period"]);
    expect(partAttrs(html, "segment-group", "root", "data-orientation")).toEqual([
      "horizontal",
      "horizontal",
    ]);
    expect(partAttrs(html, "segment-group", "item", "data-state")).toEqual([
      "unchecked",
      "checked",
      "unchecked",
      "unchecked",
      "checked",
    ]);
    expect(partTags(html, "segment-group", "item").map(has("data-disabled"))).toEqual([
      false,
      false,
      true,
      true,
      true,
    ]);
    expect(partTags(html, "segment-group", "indicator").map(has("hidden"))).toEqual([true, true]);
    const radios = html.match(/<input[^>]*type="radio"[^>]*>/g) ?? [];
    expect(radios.map(has("checked"))).toEqual([false, true, false, false, true]);
    expect(radios.map(has("disabled"))).toEqual([false, false, true, true, true]);
  });
});
