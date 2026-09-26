import { describe, expect, it } from "vitest";
import { checkboxRecipe } from "../../src/recipes/checkbox.js";

describe("checkboxRecipe", () => {
  it("defaults to size md", () => {
    expect(checkboxRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(checkboxRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for the states Ark already tracks", () => {
    // checked / indeterminate / disabled / invalid surface as Ark's own
    // data-attributes, so they must never become recipe variants.
    expect(Object.keys(checkboxRecipe.variants)).toEqual(["size"]);
  });
});
