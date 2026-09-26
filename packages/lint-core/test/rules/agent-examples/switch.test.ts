import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Switch manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root", () => {
    expect(
      check('<Switch.Root size="lg" checked={on} onCheckedChange={save} name="alerts" />'),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Switch.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
