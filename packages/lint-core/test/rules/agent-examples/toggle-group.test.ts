import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real ToggleGroup manifest", () => {
  it("accepts the recipe props and Ark's own props on the root", () => {
    expect(
      check(
        '<ToggleGroup.Root variant="outline" size="lg" multiple orientation="vertical" value={styles} onValueChange={save} />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<ToggleGroup.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
