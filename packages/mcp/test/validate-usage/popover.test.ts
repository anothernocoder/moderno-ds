import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Popover", () => {
  it("accepts real Popover usage and knows its Ark anatomy", () => {
    const code = [
      'import { Button, Popover, Portal } from "@moderno-ui/react";',
      "",
      '<Popover.Root size="sm" positioning={{ placement: "right" }}>',
      "  <Popover.Trigger asChild>",
      "    <Button>Share</Button>",
      "  </Popover.Trigger>",
      "  <Portal>",
      "    <Popover.Positioner>",
      "      <Popover.Content>",
      "        <Popover.Arrow>",
      "          <Popover.ArrowTip />",
      "        </Popover.Arrow>",
      "        <Popover.Title>Share this page</Popover.Title>",
      "        <Popover.Description>Anyone with the link can view it.</Popover.Description>",
      '        <Popover.CloseTrigger aria-label="Close">×</Popover.CloseTrigger>',
      "      </Popover.Content>",
      "    </Popover.Positioner>",
      "  </Portal>",
      "</Popover.Root>",
      "",
      '[data-scope="popover"][data-part="content"][data-size="sm"] { color: var(--popover-foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Popover.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="popover"][data-part="body"] { color: var(--popover-foreground); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"body" is not a real part of Popover');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Popover } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Popover } from "@moderno-ui/react"');
  });
});
