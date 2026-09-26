import { describe, expect, it } from "vitest";
import { selectRecipe } from "../../src/recipes/select.js";

describe("selectRecipe", () => {
  it("defaults to size md", () => {
    expect(selectRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(selectRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
  });
});
