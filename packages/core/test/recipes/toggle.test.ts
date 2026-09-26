import { describe, expect, it } from "vitest";
import { toggleRecipe } from "../../src/recipes/toggle.js";

describe("toggleRecipe", () => {
  it("defaults to the ghost variant at size md", () => {
    expect(toggleRecipe()).toEqual({ "data-variant": "ghost", "data-size": "md" });
  });

  it("maps variant and size to data-attributes", () => {
    expect(toggleRecipe({ variant: "outline", size: "sm" })).toEqual({
      "data-variant": "outline",
      "data-size": "sm",
    });
  });

  it("carries no variant for what Ark already tracks", () => {
    // Pressed, disabled surface as Ark's own props and
    // data-attributes, so they must never become recipe variants.
    expect(Object.keys(toggleRecipe.variants)).toEqual(["variant", "size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "solid" is not a toggle variant
    expect(() => toggleRecipe({ variant: "solid" })).toThrow(/invalid value/);
  });
});
