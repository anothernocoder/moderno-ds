// @vitest-environment node
import { describe, expect, it } from "vitest";
import { partTags } from "../../../core/test/ssr-parts.ts";
import IndicatorSection from "../../playground/sections/indicator.js";
import { renderSection } from "./render-section.js";

describe("Indicator SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(IndicatorSection);
    // data-pulse is a bare flag: some renderers write `data-pulse=""`, Vue writes
    // `data-pulse`; both are the same attribute to the `[data-pulse]` selector.
    const pulsing = partTags(html, "indicator", "root").map((tag) =>
      /\sdata-pulse(?:=""|[\s>])/.test(tag),
    );
    expect(pulsing).toEqual([true, false]);
    expect(partTags(html, "indicator", "dot")).toHaveLength(2);
    expect(partTags(html, "indicator", "label")).toHaveLength(1);
  });
});
