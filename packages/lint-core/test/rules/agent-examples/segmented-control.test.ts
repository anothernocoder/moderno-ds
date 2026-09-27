import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real SegmentedControl manifest", () => {
  it("accepts the recipe props and Ark's own props on the root", () => {
    expect(
      check(
        '<SegmentedControl.Root size="sm" fullWidth value={scale} onValueChange={save} name="scale" aria-label="Scale" />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside Field's sizes", () => {
    expect(check('<SegmentedControl.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
