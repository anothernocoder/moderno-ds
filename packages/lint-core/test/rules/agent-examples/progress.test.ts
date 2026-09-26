import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Progress manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root", () => {
    expect(
      check('<Progress.Root size="sm" value={progress} min={0} max={10} orientation="vertical" />'),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Progress.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
