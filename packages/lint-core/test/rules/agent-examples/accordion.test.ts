import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Accordion manifest", () => {
  it("accepts the recipe props and Ark's own props on the root", () => {
    expect(
      check(
        '<Accordion.Root variant="enclosed" size="sm" multiple collapsible value={open} onValueChange={setOpen} />',
      ),
    ).toEqual([]);
  });

  it("rejects a variant or size outside the recipe", () => {
    expect(check('<Accordion.Root variant="card" />')).toEqual([
      expect.stringContaining('Invalid value "card"'),
    ]);
    expect(check('<Accordion.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
