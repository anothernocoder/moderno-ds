import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Menu", () => {
  it("accepts real Menu usage and knows its Ark anatomy", () => {
    const code = [
      'import { Menu, Portal } from "@moderno-ui/react";',
      "",
      '<Menu.Root size="sm" onSelect={(details) => run(details.value)}>',
      "  <Menu.Trigger>",
      "    Actions <Menu.Indicator>▾</Menu.Indicator>",
      "  </Menu.Trigger>",
      "  <Portal>",
      "    <Menu.Positioner>",
      "      <Menu.Content>",
      "        <Menu.ItemGroup>",
      "          <Menu.ItemGroupLabel>File</Menu.ItemGroupLabel>",
      '          <Menu.Item value="new">New file</Menu.Item>',
      "        </Menu.ItemGroup>",
      "        <Menu.Separator />",
      "        <Menu.Root>",
      "          <Menu.TriggerItem>Share</Menu.TriggerItem>",
      "          <Portal>",
      "            <Menu.Positioner>",
      "              <Menu.Content>",
      '                <Menu.Item value="email">Email</Menu.Item>',
      "              </Menu.Content>",
      "            </Menu.Positioner>",
      "          </Portal>",
      "        </Menu.Root>",
      "      </Menu.Content>",
      "    </Menu.Positioner>",
      "  </Portal>",
      "</Menu.Root>",
      "",
      '[data-scope="menu"][data-part="item"][data-highlighted] { background-color: var(--muted); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Menu.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="menu"][data-part="option"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"option" is not a real part of Menu');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Menu } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Menu } from "@moderno-ui/react"');
  });
});
