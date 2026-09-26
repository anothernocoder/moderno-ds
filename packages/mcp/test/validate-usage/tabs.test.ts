import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Tabs", () => {
  it("accepts real Tabs usage and knows its Ark anatomy", () => {
    const code = [
      'import { Tabs } from "@moderno-ui/react";',
      "",
      '<Tabs.Root variant="enclosed" size="sm" defaultValue="account" onValueChange={save}>',
      '  <Tabs.List aria-label="Settings">',
      '    <Tabs.Trigger value="account">Account</Tabs.Trigger>',
      '    <Tabs.Trigger value="password">Password</Tabs.Trigger>',
      "    <Tabs.Indicator />",
      "  </Tabs.List>",
      '  <Tabs.Content value="account">Account settings</Tabs.Content>',
      '  <Tabs.Content value="password">Password settings</Tabs.Content>',
      "</Tabs.Root>",
      "",
      '[data-scope="tabs"][data-part="trigger"][data-selected] { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badVariant = validateUsage(manifests(), {
      framework: "react",
      code: '<Tabs.Root variant="pill" />',
    }).findings;
    expect(badVariant).toHaveLength(1);
    expect(badVariant[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badVariant[0]!.message).toContain("line, enclosed");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="tabs"][data-part="tab"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"tab" is not a real part of Tabs');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Tabs } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Tabs } from "@moderno-ui/react"');
  });
});
