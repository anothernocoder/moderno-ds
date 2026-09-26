import { describe, expect, it } from "vitest";
import { paginationRecipe } from "../../src/recipes/pagination.js";

describe("paginationRecipe", () => {
  it("defaults to size md", () => {
    expect(paginationRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(paginationRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
  });

  it("carries no variant for what Ark already decides", () => {
    // count, page, pageSize, siblingCount and boundaryCount are Ark's props;
    // the current page and a dead trigger are Ark's data-selected and disabled.
    expect(Object.keys(paginationRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a pagination size
    expect(() => paginationRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
