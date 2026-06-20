import { describe, expect, it } from "vitest";
import { buttonRecipe, selectRecipe } from "../src/recipes.js";

describe("buttonRecipe", () => {
  it("applies defaults when no props are given", () => {
    expect(buttonRecipe()).toEqual({
      "data-variant": "primary",
      "data-size": "md",
    });
  });

  it("maps props to data-attributes", () => {
    expect(buttonRecipe({ variant: "outline", size: "lg" })).toEqual({
      "data-variant": "outline",
      "data-size": "lg",
    });
  });

  it("exposes its variant schema for introspection", () => {
    expect(buttonRecipe.variants.variant).toContain("destructive");
    expect(buttonRecipe.variants.size).toEqual(["sm", "md", "lg"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "huge" is not a valid size
    expect(() => buttonRecipe({ size: "huge" })).toThrow(/invalid value/);
  });
});

describe("selectRecipe", () => {
  it("defaults to size md", () => {
    expect(selectRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(selectRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
  });
});
