import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Indicator manifest", () => {
  it("accepts every prop the binding declares", () => {
    expect(check('<Indicator variant="success" size="sm" pulse>Online</Indicator>')).toEqual([]);
  });

  it("rejects an invented prop", () => {
    expect(check("<Indicator blink>Online</Indicator>")).toEqual([
      expect.stringContaining('Unknown prop "blink"'),
    ]);
  });
});
