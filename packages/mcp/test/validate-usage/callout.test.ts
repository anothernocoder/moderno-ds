import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Callout", () => {
  it("accepts a real Callout usage and knows its anatomy", () => {
    const code = [
      'import { Callout } from "@moderno-ui/react";',
      "",
      '<Callout.Root variant="warning">',
      "  <Callout.Content>",
      "    <Callout.Title>Renaming breaks old links</Callout.Title>",
      "    <Callout.Description>Share the new address with your team.</Callout.Description>",
      "  </Callout.Content>",
      "</Callout.Root>",
      "",
      '[data-scope="callout"][data-part="title"] { font-weight: var(--font-weight-bold); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badVariant = validateUsage(manifests(), {
      framework: "react",
      code: '<Callout.Root variant="tip" />',
    }).findings;
    expect(badVariant).toHaveLength(1);
    expect(badVariant[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badVariant[0]!.message).toContain("info, success, warning, error");

    const badProp = validateUsage(manifests(), {
      framework: "react",
      code: '<Callout.Root tone="soft" />',
    }).findings;
    expect(badProp).toHaveLength(1);
    expect(badProp[0]!.message).toContain('Unknown prop "tone"');

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="callout"][data-part="action"] { color: var(--foreground); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"action" is not a real part of Callout');
  });
});
