import { describe, expect, it } from "vitest";
import { spinnerRecipe } from "../../src/recipes/spinner.js";

describe("spinnerRecipe", () => {
  it("defaults to an md ring", () => {
    expect(spinnerRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to data-size", () => {
    expect(spinnerRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
    expect(Object.keys(spinnerRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a spinner size
    expect(() => spinnerRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
