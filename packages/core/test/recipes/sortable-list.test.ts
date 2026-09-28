import { describe, expect, it } from "vitest";
import { sortableListRecipe } from "../../src/recipes/sortable-list.js";

describe("sortableListRecipe", () => {
  it("defaults to size md", () => {
    expect(sortableListRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to data-size", () => {
    expect(sortableListRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
    expect(sortableListRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what the machine already tracks", () => {
    // Dragging, disabled and the offsets are the machine's own data-attributes.
    expect(Object.keys(sortableListRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a sortable list size
    expect(() => sortableListRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
