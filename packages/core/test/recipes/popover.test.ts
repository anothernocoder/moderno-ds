import { describe, expect, it } from "vitest";
import { popoverRecipe } from "../../src/recipes/popover.js";

describe("popoverRecipe", () => {
  it("defaults to size md", () => {
    expect(popoverRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(popoverRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
    expect(popoverRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what Ark already owns", () => {
    // Open state and placement are Ark's props and surface as its data-*.
    expect(Object.keys(popoverRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a popover size
    expect(() => popoverRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
