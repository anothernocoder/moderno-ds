import { describe, expect, it } from "vitest";
import { dividerRecipe } from "../../src/recipes/divider.js";

describe("dividerRecipe", () => {
  it("defaults to a centred horizontal rule", () => {
    expect(dividerRecipe()).toEqual({ "data-align": "center", "data-orientation": "horizontal" });
  });

  it("maps orientation/align to data-attributes", () => {
    expect(dividerRecipe({ orientation: "vertical", align: "start" })).toEqual({
      "data-align": "start",
      "data-orientation": "vertical",
    });
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "diagonal" is not a valid orientation
    expect(() => dividerRecipe({ orientation: "diagonal" })).toThrow(/invalid value/);
  });
});
