import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real SortableList manifest", () => {
  it("accepts the machine's props and the size recipe on the root", () => {
    expect(
      check(
        '<SortableList.Root items={order} onReorder={save} size="sm" disabled aria-label="Slides" />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<SortableList.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
