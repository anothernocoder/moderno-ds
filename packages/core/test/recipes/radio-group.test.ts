import { describe, expect, it } from "vitest";
import { radioGroupRecipe } from "../../src/recipes/radio-group.js";

describe("radioGroupRecipe", () => {
  it("defaults to size md", () => {
    expect(radioGroupRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(radioGroupRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what Ark already tracks", () => {
    // Orientation, checked, disabled, invalid and read-only surface as Ark's
    // own data-attributes, so they must never become recipe variants.
    expect(Object.keys(radioGroupRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a radio group size
    expect(() => radioGroupRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
