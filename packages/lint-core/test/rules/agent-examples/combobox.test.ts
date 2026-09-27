import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Combobox manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root", () => {
    expect(
      check(
        '<Combobox.Root size="lg" collection={collection} multiple defaultValue={["react"]} openOnClick allowCustomValue={false} />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Combobox.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
