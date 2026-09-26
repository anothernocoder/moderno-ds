import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Chip manifest", () => {
  it("accepts every prop the binding declares", () => {
    expect(
      check(
        '<Chip variant="muted" removable removeLabel="Remove React" onRemove={drop}>React</Chip>',
      ),
    ).toEqual([]);
  });
});
