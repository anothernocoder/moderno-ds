import { describe, expect, it } from "vitest";
import { splitterRecipe } from "../../src/recipes/splitter.js";

describe("splitterRecipe", () => {
  it("defaults to the line variant", () => {
    expect(splitterRecipe()).toEqual({ "data-variant": "line" });
  });

  it("maps variant to a data-attribute", () => {
    expect(splitterRecipe({ variant: "enclosed" })).toEqual({ "data-variant": "enclosed" });
  });

  it("carries no variant for what Ark already owns", () => {
    // Ark's Root takes `size` for the panels' controlled sizes, so the recipe
    // must never add a `size` of its own; orientation is Ark's prop, and
    // dragging, focus and disabled are Ark's data-*.
    expect(Object.keys(splitterRecipe.variants)).toEqual(["variant"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "outline" is not a splitter variant
    expect(() => splitterRecipe({ variant: "outline" })).toThrow(/invalid value/);
  });
});
