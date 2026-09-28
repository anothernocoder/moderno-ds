import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Toolbar manifest", () => {
  it("accepts its own props on the root", () => {
    expect(
      check(
        '<Toolbar.Root aria-label="Canvas tools" size="sm" orientation="vertical" dir="rtl" />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Toolbar.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
