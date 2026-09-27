import { describe, expect, it } from "vitest";
import { comboboxRecipe } from "../../src/recipes/combobox.js";

describe("comboboxRecipe", () => {
  it("defaults to size md", () => {
    expect(comboboxRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(comboboxRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what Ark already decides", () => {
    // Items, filtering, the value, `multiple` and the open state are Ark's
    // props; focus, invalid, disabled, a highlighted item and an empty list
    // are Ark's data-*.
    expect(Object.keys(comboboxRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a combobox size
    expect(() => comboboxRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
