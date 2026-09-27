import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Splitter manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root, size included", () => {
    expect(
      check(
        '<Splitter.Root variant="enclosed" orientation="vertical" panels={panels} defaultSize={[30, 70]} size={sizes} onResize={save} />',
      ),
    ).toEqual([]);
  });

  it("rejects a variant outside the recipe", () => {
    expect(check('<Splitter.Root variant="outline" />')).toEqual([
      expect.stringContaining('Invalid value "outline"'),
    ]);
  });
});
