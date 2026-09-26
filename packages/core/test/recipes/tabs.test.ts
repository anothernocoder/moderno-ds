import { describe, expect, it } from "vitest";
import { tabsRecipe } from "../../src/recipes/tabs.js";

describe("tabsRecipe", () => {
  it("defaults to the line variant at size md", () => {
    expect(tabsRecipe()).toEqual({ "data-variant": "line", "data-size": "md" });
  });

  it("maps variant and size to data-attributes", () => {
    expect(tabsRecipe({ variant: "enclosed", size: "lg" })).toEqual({
      "data-variant": "enclosed",
      "data-size": "lg",
    });
  });

  it("carries no variant for what Ark already tracks", () => {
    // Selected, disabled, orientation and activation mode surface as Ark's own
    // props and data-attributes, so they must never become recipe variants.
    expect(Object.keys(tabsRecipe.variants)).toEqual(["variant", "size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "pill" is not a tabs variant
    expect(() => tabsRecipe({ variant: "pill" })).toThrow(/invalid value/);
  });
});
