import { describe, expect, it } from "vitest";
import { chipRecipe } from "../../src/recipes/chip.js";

describe("chipRecipe", () => {
  it("defaults to an outline md chip", () => {
    expect(chipRecipe()).toEqual({ "data-size": "md", "data-variant": "outline" });
  });

  it("maps variant/size to data-attributes", () => {
    expect(chipRecipe({ variant: "solid", size: "sm" })).toEqual({
      "data-size": "sm",
      "data-variant": "solid",
    });
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "lg" is not a chip size
    expect(() => chipRecipe({ size: "lg" })).toThrow(/invalid value/);
  });
});
