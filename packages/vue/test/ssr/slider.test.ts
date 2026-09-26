// @vitest-environment node
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import SliderSection from "../../playground/sections/slider.js";
import { renderSection } from "./render-section.js";

describe("Slider SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(SliderSection);
    // The recipe lands on each root, every thumb reaches the server as a slider
    // with its value and bounds (a range's two thumbs bound each other) named
    // by its label, the root carries the range's offsets inline, and each
    // marker knows where it sits.
    expect(partAttrs(html, "slider", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "slider", "thumb", "role")).toEqual(["slider", "slider", "slider"]);
    expect(partAttrs(html, "slider", "thumb", "aria-valuenow")).toEqual(["40", "20", "80"]);
    expect(partAttrs(html, "slider", "thumb", "aria-valuemin")).toEqual(["0", "0", "20"]);
    expect(partAttrs(html, "slider", "thumb", "aria-valuemax")).toEqual(["100", "80", "100"]);
    const [volumeLabel, priceLabel] = partAttrs(html, "slider", "label", "id");
    expect(partAttrs(html, "slider", "thumb", "aria-labelledby")).toEqual([
      volumeLabel,
      priceLabel,
      priceLabel,
    ]);
    const sliderRoots = partAttrs(html, "slider", "root", "style");
    expect(sliderRoots[0]).toMatch(/--slider-range-start:\s*0%/);
    expect(sliderRoots[0]).toMatch(/--slider-range-end:\s*60%/);
    expect(sliderRoots[1]).toMatch(/--slider-range-start:\s*20%/);
    expect(sliderRoots[1]).toMatch(/--slider-range-end:\s*20%/);
    expect(partAttrs(html, "slider", "marker", "data-state")).toEqual([
      "under-value",
      "over-value",
      "over-value",
    ]);
    expect(html).toMatch(
      /data-scope="slider"[^>]*data-part="value-text"[^>]*>(?:<!--[^>]*-->)*40</,
    );
  });
});
