import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Accordion", () => {
  it("accepts real Accordion usage and knows its Ark anatomy", () => {
    const code = [
      'import { Accordion } from "@moderno-ui/react";',
      "",
      '<Accordion.Root variant="enclosed" size="sm" defaultValue={["shipping"]} multiple>',
      '  <Accordion.Item value="shipping">',
      "    <Accordion.ItemTrigger>",
      "      Shipping",
      "      <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>",
      "    </Accordion.ItemTrigger>",
      "    <Accordion.ItemContent>Three to five working days.</Accordion.ItemContent>",
      "  </Accordion.Item>",
      "</Accordion.Root>",
      "",
      '[data-scope="accordion"][data-part="item-trigger"][data-state="open"] { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badVariant = validateUsage(manifests(), {
      framework: "react",
      code: '<Accordion.Root variant="card" />',
    }).findings;
    expect(badVariant).toHaveLength(1);
    expect(badVariant[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badVariant[0]!.message).toContain("line, enclosed");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="accordion"][data-part="panel"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"panel" is not a real part of Accordion');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Accordion } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Accordion } from "@moderno-ui/react"');
  });
});
