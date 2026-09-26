// @vitest-environment node
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import SkeletonSection from "../../playground/sections/skeleton.js";
import { renderSection } from "./render-section.js";

describe("Skeleton SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(SkeletonSection);
    // Every shape reaches the server, hidden from assistive tech.
    expect(partAttrs(html, "skeleton", "root", "data-shape")).toEqual(["text", "rect", "circle"]);
    expect(partAttrs(html, "skeleton", "root", "aria-hidden")).toEqual(["true", "true", "true"]);
  });
});
