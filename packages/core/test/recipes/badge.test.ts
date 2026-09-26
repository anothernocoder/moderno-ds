import { describe, expect, it } from "vitest";
import { badgeRecipe } from "../../src/recipes/badge.js";

describe("badgeRecipe", () => {
  it("defaults to a neutral md badge", () => {
    expect(badgeRecipe()).toEqual({ "data-size": "md", "data-variant": "neutral" });
  });

  it("carries the four statuses beside the three plain styles", () => {
    expect(badgeRecipe.variants.variant).toEqual([
      "neutral",
      "solid",
      "outline",
      "info",
      "success",
      "warning",
      "error",
    ]);
    expect(badgeRecipe({ variant: "error", size: "sm" })).toEqual({
      "data-size": "sm",
      "data-variant": "error",
    });
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "danger" is not a badge variant ("error" is)
    expect(() => badgeRecipe({ variant: "danger" })).toThrow(/invalid value/);
  });
});
