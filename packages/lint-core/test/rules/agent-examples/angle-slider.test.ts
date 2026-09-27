import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real AngleSlider manifest", () => {
  it("accepts its own props and Ark's on the root", () => {
    expect(
      check(
        '<AngleSlider.Root size="sm" defaultValue={90} step={15} marks={[0, 90, 180, 270]} getAriaValueText={say} onValueChange={save} disabled />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<AngleSlider.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
