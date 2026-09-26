import { describe, expect, it } from "vitest";
import { accordionRecipe } from "../../src/recipes/accordion.js";

describe("accordionRecipe", () => {
  it("defaults to the line variant at size md", () => {
    expect(accordionRecipe()).toEqual({ "data-variant": "line", "data-size": "md" });
  });

  it("maps variant and size to data-attributes", () => {
    expect(accordionRecipe({ variant: "enclosed", size: "sm" })).toEqual({
      "data-variant": "enclosed",
      "data-size": "sm",
    });
  });

  it("carries no variant for what Ark already tracks", () => {
    // Open, disabled, multiple, collapsible and orientation surface as Ark's
    // own props and data-attributes, so they must never become recipe variants.
    expect(Object.keys(accordionRecipe.variants)).toEqual(["variant", "size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "card" is not an accordion variant
    expect(() => accordionRecipe({ variant: "card" })).toThrow(/invalid value/);
  });
});
