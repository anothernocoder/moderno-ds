import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Drawer manifest", () => {
  it("accepts the recipe prop and Ark's own Dialog props on the root", () => {
    expect(
      check(
        '<Drawer.Root placement="left" open={open} onOpenChange={save} closeOnInteractOutside={false} />',
      ),
    ).toEqual([]);
  });

  it("rejects a placement outside the recipe", () => {
    expect(check('<Drawer.Root placement="center" />')).toEqual([
      expect.stringContaining('Invalid value "center"'),
    ]);
  });
});
