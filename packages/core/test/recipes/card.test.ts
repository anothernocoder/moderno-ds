import { describe, expect, it } from "vitest";
import { cardRecipe } from "../../src/recipes/card.js";

describe("cardRecipe", () => {
  it("applies defaults when no props are given", () => {
    expect(cardRecipe()).toEqual({ "data-variant": "outline", "data-size": "md" });
  });

  it("maps props to data-attributes", () => {
    expect(cardRecipe({ variant: "muted", size: "lg" })).toEqual({
      "data-variant": "muted",
      "data-size": "lg",
    });
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "elevated" is not a valid card variant
    expect(() => cardRecipe({ variant: "elevated" })).toThrow(/invalid value/);
  });
});
