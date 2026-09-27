import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Editable manifest", () => {
  it("accepts its own props and Ark's on the root", () => {
    expect(
      check(
        '<Editable.Root size="sm" activationMode="click" defaultValue="Background" submitMode="enter" placeholder="Untitled" maxLength={40} onValueCommit={rename} />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Editable.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
