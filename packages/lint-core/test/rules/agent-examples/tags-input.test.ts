import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real TagsInput manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root", () => {
    expect(
      check(
        '<TagsInput.Root size="lg" defaultValue={["react"]} max={5} delimiter="," editable={false} addOnPaste />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<TagsInput.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
