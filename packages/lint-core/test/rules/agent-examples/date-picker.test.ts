import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real DatePicker manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root", () => {
    expect(
      check(
        '<DatePicker.Root size="lg" selectionMode="range" locale="es-ES" numOfMonths={2} closeOnSelect={false} />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<DatePicker.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
