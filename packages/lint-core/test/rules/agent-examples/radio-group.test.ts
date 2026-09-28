import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real RadioGroup manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root", () => {
    expect(
      check(
        '<RadioGroup.Root size="lg" orientation="horizontal" value={plan} onValueChange={save} name="plan" />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<RadioGroup.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });

  it("accepts the tile variant with its column count and media shape", () => {
    expect(
      check('<RadioGroup.Root variant="tile" columns={3} aspectRatio="4:3" defaultValue="a" />'),
    ).toEqual([]);
  });

  it("rejects a variant or an aspect ratio outside the recipe", () => {
    expect(check('<RadioGroup.Root variant="grid" />')).toEqual([
      expect.stringContaining('Invalid value "grid"'),
    ]);
    expect(check('<RadioGroup.Root variant="tile" aspectRatio="21:9" />')).toEqual([
      expect.stringContaining('Invalid value "21:9"'),
    ]);
  });
});
