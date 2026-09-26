// @vitest-environment node
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import BadgeSection from "../../playground/sections/badge.js";
import { renderSection } from "./render-section.js";

describe("Badge SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(BadgeSection);
    // The optional dot part has to serialise on the right element.
    expect(partAttrs(html, "badge", "root", "data-variant")).toEqual([
      "neutral",
      "success",
      "error",
    ]);
    expect(partTags(html, "badge", "dot")).toHaveLength(1);
  });
});
