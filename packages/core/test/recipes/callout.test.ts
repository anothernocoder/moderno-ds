import { describe, expect, it } from "vitest";
import { alertRecipe } from "../../src/recipes/alert.js";
import { calloutRecipe } from "../../src/recipes/callout.js";

describe("calloutRecipe", () => {
  it("defaults to the informational status", () => {
    expect(calloutRecipe()).toEqual({ "data-variant": "info" });
  });

  it("maps variant to data-variant and has no size", () => {
    expect(calloutRecipe({ variant: "warning" })).toEqual({ "data-variant": "warning" });
    expect(Object.keys(calloutRecipe.variants)).toEqual(["variant"]);
  });

  it("covers the same four statuses as Alert", () => {
    expect(calloutRecipe.variants.variant).toEqual(alertRecipe.variants.variant);
  });

  it("rejects a status outside the schema", () => {
    // @ts-expect-error — "tip" is not a Moderno status
    expect(() => calloutRecipe({ variant: "tip" })).toThrow(/invalid value/);
  });
});
