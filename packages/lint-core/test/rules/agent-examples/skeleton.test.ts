import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Skeleton manifest", () => {
  it("accepts every prop the binding declares", () => {
    expect(check('<Skeleton shape="circle" style={{ width: "3rem" }} />')).toEqual([]);
  });

  it("rejects a value outside the recipe", () => {
    expect(check('<Skeleton shape="square" />')).toEqual([
      expect.stringContaining('Invalid value "square"'),
    ]);
  });
});
