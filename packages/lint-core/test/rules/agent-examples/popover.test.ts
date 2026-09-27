import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Popover manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root", () => {
    expect(
      check(
        '<Popover.Root size="sm" positioning={{ placement: "right" }} open={open} onOpenChange={save} modal={false} />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Popover.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
