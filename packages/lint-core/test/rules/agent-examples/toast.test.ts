import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Toast manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root", () => {
    expect(check('<Toast.Root size="sm" asChild={false} className="note" />')).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Toast.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
