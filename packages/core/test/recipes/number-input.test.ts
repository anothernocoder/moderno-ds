import { describe, expect, it } from "vitest";
import { numberInputRecipe } from "../../src/recipes/number-input.js";

describe("numberInputRecipe", () => {
  it("defaults to size md", () => {
    expect(numberInputRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(numberInputRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what Ark already decides", () => {
    // min, max, step and the number format are Ark's props; focus, disabled,
    // invalid and scrubbing are Ark's data-*.
    expect(Object.keys(numberInputRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a number-input size
    expect(() => numberInputRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
