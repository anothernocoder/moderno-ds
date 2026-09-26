import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Toggle manifest", () => {
  it("accepts the recipe props and Ark's own props on the root", () => {
    expect(
      check(
        '<Toggle.Root variant="outline" size="sm" pressed={bold} onPressedChange={setBold} aria-label="Bold" />',
      ),
    ).toEqual([]);
  });

  it("rejects a variant outside the recipe", () => {
    expect(check('<Toggle.Root variant="solid" />')).toEqual([
      expect.stringContaining('Invalid value "solid"'),
    ]);
  });
});
