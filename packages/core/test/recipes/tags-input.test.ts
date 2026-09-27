import { describe, expect, it } from "vitest";
import { tagsInputRecipe } from "../../src/recipes/tags-input.js";

describe("tagsInputRecipe", () => {
  it("defaults to size md", () => {
    expect(tagsInputRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(tagsInputRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
  });

  it("carries no variant for what Ark already decides", () => {
    // The value, delimiter, max and editing are Ark's props; focus, invalid,
    // disabled, read-only and a highlighted tag are Ark's data-*.
    expect(Object.keys(tagsInputRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a tags-input size
    expect(() => tagsInputRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
