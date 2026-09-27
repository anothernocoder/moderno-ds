import { describe, expect, it } from "vitest";
import { datePickerRecipe } from "../../src/recipes/date-picker.js";

describe("datePickerRecipe", () => {
  it("defaults to size md", () => {
    expect(datePickerRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(datePickerRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
    expect(datePickerRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what Ark already owns", () => {
    // Selection mode, locale and open state are Ark's props and surface as its data-*.
    expect(Object.keys(datePickerRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a date picker size
    expect(() => datePickerRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
