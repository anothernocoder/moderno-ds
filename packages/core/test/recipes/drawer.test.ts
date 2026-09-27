import { describe, expect, it } from "vitest";
import { drawerRecipe } from "../../src/recipes/drawer.js";

describe("drawerRecipe", () => {
  it("defaults to the right edge", () => {
    expect(drawerRecipe()).toEqual({ "data-placement": "right" });
  });

  it("maps placement to a data-attribute", () => {
    for (const placement of ["left", "right", "top", "bottom"] as const) {
      expect(drawerRecipe({ placement })).toEqual({ "data-placement": placement });
    }
  });

  it("carries no variant for what Ark already owns", () => {
    // Open state and focus are Ark's props and surface as its data-*.
    expect(Object.keys(drawerRecipe.variants)).toEqual(["placement"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "center" is not a drawer placement
    expect(() => drawerRecipe({ placement: "center" })).toThrow(/invalid value/);
  });
});
