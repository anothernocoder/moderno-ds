import { describe, expect, it } from "vitest";
import { toastRecipe } from "../../src/recipes/toast.js";

describe("toastRecipe", () => {
  it("defaults to size md", () => {
    expect(toastRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(toastRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
    expect(toastRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what Ark already owns", () => {
    // The status is Ark's `type` (data-type); placement is the toaster's.
    expect(Object.keys(toastRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a toast size
    expect(() => toastRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
