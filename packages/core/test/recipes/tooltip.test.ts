import { describe, expect, it } from "vitest";
import { tooltipRecipe } from "../../src/recipes/tooltip.js";

describe("tooltipRecipe", () => {
  it("defaults to size md", () => {
    expect(tooltipRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(tooltipRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
    expect(tooltipRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what Ark already decides", () => {
    // Open/closed, placement and delays are Ark's props and data-*.
    expect(Object.keys(tooltipRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a tooltip size
    expect(() => tooltipRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
