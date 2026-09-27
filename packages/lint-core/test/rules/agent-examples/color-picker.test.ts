import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real ColorPicker manifest", () => {
  it("accepts its own props and Ark's on the root", () => {
    expect(
      check(
        '<ColorPicker size="sm" alpha swatches={["#EF4444"]} defaultValue="#1E90FF" name="brand" portalled={false} defaultOpen closeOnSelect />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<ColorPicker size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
