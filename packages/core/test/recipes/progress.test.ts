import { describe, expect, it } from "vitest";
import { progressRecipe } from "../../src/recipes/progress.js";

describe("progressRecipe", () => {
  it("defaults to size md", () => {
    expect(progressRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(progressRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what Ark or the anatomy already decides", () => {
    // Linear vs circular is the parts a consumer composes; loading, complete
    // and indeterminate are Ark's data-state; orientation is Ark's prop.
    expect(Object.keys(progressRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a progress size
    expect(() => progressRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
