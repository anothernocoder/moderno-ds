import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Drawer", () => {
  it("accepts real Drawer usage and knows its Ark anatomy", () => {
    const code = [
      'import { Button, Drawer, Portal } from "@moderno-ui/react";',
      "",
      '<Drawer.Root placement="bottom">',
      "  <Drawer.Trigger asChild>",
      "    <Button>Share</Button>",
      "  </Drawer.Trigger>",
      "  <Portal>",
      "    <Drawer.Backdrop />",
      "    <Drawer.Positioner>",
      "      <Drawer.Content>",
      "        <Drawer.Title>Share</Drawer.Title>",
      "        <Drawer.Description>Send this page to your team.</Drawer.Description>",
      '        <Drawer.CloseTrigger aria-label="Close">×</Drawer.CloseTrigger>',
      "      </Drawer.Content>",
      "    </Drawer.Positioner>",
      "  </Portal>",
      "</Drawer.Root>",
      "",
      '[data-scope="drawer"][data-part="content"][data-placement="bottom"] { color: var(--popover-foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badPlacement = validateUsage(manifests(), {
      framework: "react",
      code: '<Drawer.Root placement="center" />',
    }).findings;
    expect(badPlacement).toHaveLength(1);
    expect(badPlacement[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badPlacement[0]!.message).toContain("left, right, top, bottom");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="drawer"][data-part="body"] { color: var(--popover-foreground); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"body" is not a real part of Drawer');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Drawer } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Drawer } from "@moderno-ui/react"');
  });
});
