import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Callout manifest", () => {
  it("accepts the recipe prop and native attributes on the root", () => {
    expect(check('<Callout.Root variant="success" id="tip">Saved</Callout.Root>')).toEqual([]);
  });

  it("rejects a value outside the recipe and an invented prop", () => {
    expect(check('<Callout.Root variant="tip" />')).toEqual([
      expect.stringContaining('Invalid value "tip"'),
    ]);
    expect(check('<Callout.Root tone="soft" />')).toEqual([
      expect.stringContaining('Unknown prop "tone"'),
    ]);
  });
});
