// @vitest-environment node
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import AngleSliderSection from "../../playground/sections/angle-slider.js";
import { renderSection } from "./render-section.js";

describe("AngleSlider SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(AngleSliderSection);
    // Ark's angle-slider machine. The recipe lands on each root, each thumb
    // reaches the server as a slider with its angle (370° wrapped to 10°),
    // spoken in degrees and named by its label; the root carries --angle
    // inline, each marker knows where it sits, and the angle field shows the
    // formatted angle, named by the same label.
    expect(partAttrs(html, "angle-slider", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "angle-slider", "thumb", "role")).toEqual(["slider", "slider"]);
    expect(partAttrs(html, "angle-slider", "thumb", "aria-valuenow")).toEqual(["45", "10"]);
    expect(partAttrs(html, "angle-slider", "thumb", "aria-valuetext")).toEqual([
      "45 degrees",
      "10 degrees",
    ]);
    const labels = partAttrs(html, "angle-slider", "label", "id");
    expect(partAttrs(html, "angle-slider", "thumb", "aria-labelledby")).toEqual(labels);
    const roots = partAttrs(html, "angle-slider", "root", "style");
    expect(roots[0]).toMatch(/--angle:\s*45deg/);
    expect(roots[1]).toMatch(/--angle:\s*10deg/);
    expect(partAttrs(html, "angle-slider", "marker", "data-state")).toEqual([
      "under-value",
      "over-value",
      "over-value",
      "over-value",
    ]);
    expect(partAttrs(html, "number-input", "root", "data-size")).toEqual(["md"]);
    expect(partAttrs(html, "number-input", "input", "value")).toEqual(["45°"]);
    expect(partAttrs(html, "number-input", "input", "aria-labelledby")).toEqual([labels[0]]);
  });
});
