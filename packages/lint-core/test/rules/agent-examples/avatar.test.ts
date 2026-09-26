import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Avatar manifest", () => {
  it("accepts the recipe props and Ark's own props on the root", () => {
    expect(
      check('<Avatar.Root size="sm" shape="square" onStatusChange={track}>AL</Avatar.Root>'),
    ).toEqual([]);
  });

  it("rejects a value outside the recipe", () => {
    expect(check('<Avatar.Root shape="rounded" />')).toEqual([
      expect.stringContaining('Invalid value "rounded"'),
    ]);
    expect(check('<Avatar.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
