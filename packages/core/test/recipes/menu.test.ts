import { describe, expect, it } from "vitest";
import { menuRecipe } from "../../src/recipes/menu.js";

describe("menuRecipe", () => {
  it("defaults to size md", () => {
    expect(menuRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(menuRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
    expect(menuRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });
});
