import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on ColorPicker", () => {
  it("accepts real ColorPicker usage and knows its parts", () => {
    const code = [
      'import { ColorPicker, Field } from "@moderno-ui/react";',
      "",
      "<Field.Root>",
      "  <Field.Label>Brand color</Field.Label>",
      '  <ColorPicker size="sm" alpha swatches={brandSwatches} value={color} onValueChange={(details) => setColor(details.value)} />',
      "</Field.Root>",
      "",
      '[data-scope="color-picker"][data-part="swatch-trigger"][data-state="checked"] { outline-color: var(--primary); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toEqual([]);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<ColorPicker size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="color-picker"][data-part="hue-slider"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"hue-slider" is not a real part of ColorPicker');
  });
});
