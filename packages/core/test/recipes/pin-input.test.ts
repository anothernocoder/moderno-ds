import { describe, expect, it } from "vitest";
import { pinInputRecipe } from "../../src/recipes/pin-input.js";

describe("pinInputRecipe", () => {
  it("defaults to size md", () => {
    expect(pinInputRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(pinInputRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for the states Ark already tracks", () => {
    // filled / complete / invalid / disabled arrive as Ark data-attributes, so
    // the recipe must not grow a parallel (and divergible) variant for them.
    expect(Object.keys(pinInputRecipe.variants)).toEqual(["size"]);
  });
});
