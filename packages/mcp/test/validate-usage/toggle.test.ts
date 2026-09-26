import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Toggle", () => {
  it("accepts real Toggle usage and catches a variant outside the recipe", () => {
    const code = [
      'import { Toggle } from "@moderno-ui/react";',
      "",
      '<Toggle.Root variant="outline" size="sm" defaultPressed onPressedChange={save}>',
      '  <Toggle.Indicator fallback="☆">★</Toggle.Indicator>',
      "  Favorite",
      "</Toggle.Root>",
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badVariant = validateUsage(manifests(), {
      framework: "react",
      code: '<Toggle.Root variant="solid" />',
    }).findings;
    expect(badVariant).toHaveLength(1);
    expect(badVariant[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badVariant[0]!.message).toContain("ghost, outline");
  });
});
