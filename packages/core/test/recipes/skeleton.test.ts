import { describe, expect, it } from "vitest";
import { skeletonRecipe } from "../../src/recipes/skeleton.js";

describe("skeletonRecipe", () => {
  it("defaults to a text line", () => {
    expect(skeletonRecipe()).toEqual({ "data-shape": "text" });
  });

  it("maps shape to data-shape and carries no size", () => {
    expect(skeletonRecipe({ shape: "circle" })).toEqual({ "data-shape": "circle" });
    expect(Object.keys(skeletonRecipe.variants)).toEqual(["shape"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "square" is not a skeleton shape ("rect" is)
    expect(() => skeletonRecipe({ shape: "square" })).toThrow(/invalid value/);
  });
});
