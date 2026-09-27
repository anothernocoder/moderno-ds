import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Tooltip", () => {
  it("accepts real Tooltip usage and knows its Ark anatomy", () => {
    const code = [
      'import { Button, Portal, Tooltip } from "@moderno-ui/react";',
      "",
      '<Tooltip.Root size="lg" openDelay={200} positioning={{ placement: "right" }}>',
      "  <Tooltip.Trigger asChild>",
      '    <Button variant="outline">Save</Button>',
      "  </Tooltip.Trigger>",
      "  <Portal>",
      "    <Tooltip.Positioner>",
      "      <Tooltip.Content>",
      "        <Tooltip.Arrow>",
      "          <Tooltip.ArrowTip />",
      "        </Tooltip.Arrow>",
      "        Save your changes",
      "      </Tooltip.Content>",
      "    </Tooltip.Positioner>",
      "  </Portal>",
      "</Tooltip.Root>",
      "",
      '[data-scope="tooltip"][data-part="content"][data-side="top"] { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Tooltip.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="tooltip"][data-part="bubble"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"bubble" is not a real part of Tooltip');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Tooltip } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Tooltip } from "@moderno-ui/react"');
  });
});
