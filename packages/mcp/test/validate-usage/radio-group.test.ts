import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on RadioGroup", () => {
  it("accepts a real RadioGroup usage and knows its Ark anatomy", () => {
    const code = [
      'import { RadioGroup } from "@moderno-ui/react";',
      "",
      '<RadioGroup.Root size="sm" orientation="horizontal" defaultValue="standard" onValueChange={save}>',
      "  <RadioGroup.Label>Shipping</RadioGroup.Label>",
      '  <RadioGroup.Item value="standard">',
      "    <RadioGroup.ItemControl />",
      "    <RadioGroup.ItemText>",
      "      Standard",
      "      <RadioGroup.ItemDescription>3–5 business days</RadioGroup.ItemDescription>",
      "    </RadioGroup.ItemText>",
      "    <RadioGroup.ItemHiddenInput />",
      "  </RadioGroup.Item>",
      "</RadioGroup.Root>",
      "",
      '[data-scope="radio-group"][data-part="item-description"] { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<RadioGroup.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="radio-group"][data-part="radio"] { border-color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"radio" is not a real part of RadioGroup');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { RadioGroup } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { RadioGroup } from "@moderno-ui/react"');
  });
});
