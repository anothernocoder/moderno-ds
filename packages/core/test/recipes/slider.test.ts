import { describe, expect, it } from "vitest";
import { sliderRecipe } from "../../src/recipes/slider.js";

describe("sliderRecipe", () => {
  it("defaults to size md", () => {
    expect(sliderRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(sliderRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
  });

  it("carries no variant for what Ark or the anatomy already decides", () => {
    // One thumb or a range is the value and the thumbs a consumer renders;
    // dragging, disabled and invalid are Ark's data-*; orientation is Ark's prop.
    expect(Object.keys(sliderRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a slider size
    expect(() => sliderRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
