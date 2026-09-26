import { describe, expect, it } from "vitest";
import { toggleGroupRecipe } from "../../src/recipes/toggle-group.js";

describe("toggleGroupRecipe", () => {
  it("defaults to the ghost variant at size md", () => {
    expect(toggleGroupRecipe()).toEqual({ "data-variant": "ghost", "data-size": "md" });
  });

  it("maps variant and size to data-attributes", () => {
    expect(toggleGroupRecipe({ variant: "outline", size: "sm" })).toEqual({
      "data-variant": "outline",
      "data-size": "sm",
    });
  });

  it("carries no variant for what Ark already tracks", () => {
    // Pressed, disabled, orientation and multiple surface as Ark's own props and
    // data-attributes, so they must never become recipe variants.
    expect(Object.keys(toggleGroupRecipe.variants)).toEqual(["variant", "size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "solid" is not a toggle group variant
    expect(() => toggleGroupRecipe({ variant: "solid" })).toThrow(/invalid value/);
  });
});
