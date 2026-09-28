import { describe, expect, it } from "vitest";
import { vectorPadRecipe } from "../../src/recipes/vector-pad.js";

describe("vectorPadRecipe", () => {
  it("defaults to size md", () => {
    expect(vectorPadRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(vectorPadRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what the machine already decides", () => {
    // The value, range, step, invertY, disabled, read-only and invalid are machine props and data-*.
    expect(Object.keys(vectorPadRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a vector pad size
    expect(() => vectorPadRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
