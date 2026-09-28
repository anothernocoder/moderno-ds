import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real VectorPad manifest", () => {
  it("accepts the machine's props and the recipe's on the root", () => {
    expect(
      check(
        '<VectorPad.Root size="sm" defaultValue={{ x: 0, y: 0 }} min={0} max={{ x: 200, y: 100 }} step={5} invertY getAriaValueText={say} onValueChange={save} onValueChangeEnd={commit} disabled />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<VectorPad.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
