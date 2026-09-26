import { describe, expect, it } from "vitest";
import { indicatorAttrs, indicatorRecipe, indicatorRole } from "../../src/recipes/indicator.js";

describe("indicatorRecipe / indicatorAttrs", () => {
  it("defaults to a neutral md dot with no pulse", () => {
    expect(indicatorRecipe()).toEqual({ "data-size": "md", "data-variant": "neutral" });
    expect(indicatorAttrs()).toEqual({ "data-size": "md", "data-variant": "neutral" });
  });

  it("adds a bare data-pulse only when pulse is on", () => {
    expect(indicatorAttrs({ variant: "success", pulse: true })).toEqual({
      "data-size": "md",
      "data-variant": "success",
      "data-pulse": "",
    });
    expect(indicatorAttrs({ pulse: false })).not.toHaveProperty("data-pulse");
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "solid" is a badge variant, not an indicator status
    expect(() => indicatorAttrs({ variant: "solid" })).toThrow(/invalid value/);
  });
});

describe("indicatorRole", () => {
  it("makes a named bare dot an image, so its name is read", () => {
    expect(indicatorRole(false, { "aria-label": "Offline" })).toBe("img");
    expect(indicatorRole(false, { "aria-labelledby": "status-text" })).toBe("img");
  });

  it("leaves a labelled indicator a plain span", () => {
    expect(indicatorRole(true, { "aria-label": "Offline" })).toBeUndefined();
    expect(indicatorRole(true, {})).toBeUndefined();
  });

  it("leaves an unnamed bare dot decorative", () => {
    expect(indicatorRole(false, {})).toBeUndefined();
    expect(indicatorRole(false, { "aria-label": "" })).toBeUndefined();
  });
});
