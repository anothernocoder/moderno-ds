import { describe, expect, it } from "vitest";
import { cx, partAttrs } from "../src/index.js";

describe("cx — class merge", () => {
  it("joins truthy string values, dropping falsy ones", () => {
    expect(cx("a", false, "b", undefined, null, "c")).toBe("a b c");
  });

  it("flattens nested arrays of classes", () => {
    expect(cx("a", ["b", false, ["c"]])).toBe("a b c");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(cx(false, undefined, null)).toBe("");
  });
});

describe("partAttrs — Ark-style scope/part attributes", () => {
  it("builds data-scope/data-part for a component part", () => {
    expect(partAttrs("dialog", "content")).toEqual({
      "data-scope": "dialog",
      "data-part": "content",
    });
  });
});
