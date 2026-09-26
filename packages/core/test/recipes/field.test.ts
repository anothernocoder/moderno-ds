import { describe, expect, it } from "vitest";
import { fieldRecipe } from "../../src/recipes/field.js";

describe("fieldRecipe", () => {
  it("defaults to size md", () => {
    expect(fieldRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(fieldRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for the states Ark already tracks", () => {
    // invalid/disabled/required are Ark data-attributes, not recipe variants.
    expect(Object.keys(fieldRecipe.variants)).toEqual(["size"]);
  });
});
