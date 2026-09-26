import { describe, expect, it } from "vitest";
import { switchRecipe } from "../../src/recipes/switch.js";

describe("switchRecipe", () => {
  it("defaults to size md", () => {
    expect(switchRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(switchRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
  });

  it("carries no variant for the states Ark already tracks", () => {
    // on/off, disabled, invalid and read-only surface as Ark's own
    // data-attributes, so they must never become recipe variants.
    expect(Object.keys(switchRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a switch size
    expect(() => switchRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
