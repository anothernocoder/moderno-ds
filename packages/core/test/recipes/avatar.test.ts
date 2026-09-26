import { describe, expect, it } from "vitest";
import { avatarRecipe } from "../../src/recipes/avatar.js";

describe("avatarRecipe", () => {
  it("defaults to an md circle", () => {
    expect(avatarRecipe()).toEqual({ "data-size": "md", "data-shape": "circle" });
  });

  it("maps size and shape to data-size and data-shape", () => {
    expect(avatarRecipe({ size: "lg", shape: "square" })).toEqual({
      "data-size": "lg",
      "data-shape": "square",
    });
    expect(Object.keys(avatarRecipe.variants)).toEqual(["size", "shape"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "rounded" is not an avatar shape
    expect(() => avatarRecipe({ shape: "rounded" })).toThrow(/invalid value/);
    // @ts-expect-error — "xl" is not an avatar size
    expect(() => avatarRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
