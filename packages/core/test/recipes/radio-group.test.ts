import { describe, expect, it } from "vitest";
import { radioGroupAttrs, radioGroupRecipe } from "../../src/recipes/radio-group.js";

describe("radioGroupRecipe", () => {
  it("defaults to the list variant at size md", () => {
    expect(radioGroupRecipe()).toEqual({ "data-size": "md", "data-variant": "list" });
  });

  it("maps size, variant and aspect ratio to data-attributes", () => {
    expect(radioGroupRecipe({ size: "lg", variant: "tile", aspectRatio: "4:3" })).toEqual({
      "data-size": "lg",
      "data-variant": "tile",
      "data-aspect-ratio": "4:3",
    });
  });

  it("leaves the aspect ratio unset so the stylesheet's 16:9 applies", () => {
    expect(radioGroupRecipe({ variant: "tile" })).not.toHaveProperty("data-aspect-ratio");
  });

  it("carries no variant for what Ark already tracks", () => {
    // Orientation, checked, disabled, invalid and read-only surface as Ark's
    // own data-attributes, so they must never become recipe variants.
    expect(Object.keys(radioGroupRecipe.variants)).toEqual(["variant", "size", "aspectRatio"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a radio group size
    expect(() => radioGroupRecipe({ size: "xl" })).toThrow(/invalid value/);
    // @ts-expect-error — "grid" is not a radio group variant
    expect(() => radioGroupRecipe({ variant: "grid" })).toThrow(/invalid value/);
  });
});

describe("radioGroupAttrs", () => {
  it("is the recipe when no columns are given", () => {
    expect(radioGroupAttrs({ variant: "tile" })).toEqual(radioGroupRecipe({ variant: "tile" }));
  });

  it("adds data-columns for a fixed column count", () => {
    expect(radioGroupAttrs({ variant: "tile", columns: 3 })).toEqual({
      "data-size": "md",
      "data-variant": "tile",
      "data-columns": "3",
    });
  });

  it("rejects a column count the stylesheet has no rule for", () => {
    // @ts-expect-error — 7 is not a supported column count
    expect(() => radioGroupAttrs({ columns: 7 })).toThrow(/invalid value "7" for "columns"/);
  });
});
