import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Badge manifest", () => {
  it("accepts every prop the binding declares", () => {
    expect(check('<Badge variant="warning" size="sm" dot>Pending</Badge>')).toEqual([]);
  });

  it("rejects a value outside the recipe", () => {
    expect(check('<Badge variant="danger">Failed</Badge>')).toEqual([
      expect.stringContaining('Invalid value "danger"'),
    ]);
  });
});
