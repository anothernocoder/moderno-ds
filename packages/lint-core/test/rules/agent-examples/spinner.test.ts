import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Spinner manifest", () => {
  it("accepts every prop the binding declares", () => {
    expect(check('<Spinner size="lg" label="Loading invoices" />')).toEqual([]);
  });

  it("rejects an invented prop and a value outside the recipe", () => {
    expect(check('<Spinner size="xl" />')).toEqual([expect.stringContaining('Invalid value "xl"')]);
    expect(check("<Spinner speed={2} />")).toEqual([
      expect.stringContaining('Unknown prop "speed"'),
    ]);
  });
});
