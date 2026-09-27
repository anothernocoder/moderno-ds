import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Combobox", () => {
  it("accepts real Combobox usage and knows its Ark anatomy", () => {
    const code = [
      'import { Combobox, Portal, useFilter, useListCollection } from "@moderno-ui/react";',
      "",
      '<Combobox.Root size="sm" multiple collection={collection} onInputValueChange={(e) => filter(e.inputValue)}>',
      "  <Combobox.Label>Framework</Combobox.Label>",
      "  <Combobox.Control>",
      "    <Combobox.Input />",
      "    <Combobox.ClearTrigger>×</Combobox.ClearTrigger>",
      "    <Combobox.Trigger>▾</Combobox.Trigger>",
      "  </Combobox.Control>",
      "  <Portal>",
      "    <Combobox.Positioner>",
      "      <Combobox.Content>",
      "        <Combobox.Empty>No frameworks found</Combobox.Empty>",
      "        {collection.items.map((item) => (",
      "          <Combobox.Item key={item.value} item={item}>",
      "            <Combobox.ItemText>{item.label}</Combobox.ItemText>",
      "            <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>",
      "          </Combobox.Item>",
      "        ))}",
      "      </Combobox.Content>",
      "    </Combobox.Positioner>",
      "  </Portal>",
      "</Combobox.Root>",
      "",
      '[data-scope="combobox"][data-part="empty"] { color: var(--muted-foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Combobox.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="combobox"][data-part="option"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"option" is not a real part of Combobox');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Combobox } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Combobox } from "@moderno-ui/react"');
  });
});
