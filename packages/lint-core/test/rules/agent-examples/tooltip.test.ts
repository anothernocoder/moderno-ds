import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Tooltip manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root", () => {
    expect(
      check(
        '<Tooltip.Root size="sm" openDelay={0} closeDelay={100} positioning={{ placement: "top" }} interactive />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Tooltip.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
