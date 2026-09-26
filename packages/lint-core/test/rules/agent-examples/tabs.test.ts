import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Tabs manifest", () => {
  it("accepts the recipe props and Ark's own props on the root", () => {
    expect(
      check(
        '<Tabs.Root variant="enclosed" size="sm" orientation="vertical" activationMode="manual" value={tab} onValueChange={setTab} />',
      ),
    ).toEqual([]);
  });

  it("rejects a variant or size outside the recipe", () => {
    expect(check('<Tabs.Root variant="pill" />')).toEqual([
      expect.stringContaining('Invalid value "pill"'),
    ]);
    expect(check('<Tabs.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
