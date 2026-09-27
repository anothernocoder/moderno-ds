import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on SegmentedControl", () => {
  it("accepts a real SegmentedControl usage and knows its Ark anatomy", () => {
    const code = [
      'import { SegmentedControl } from "@moderno-ui/react";',
      "",
      '<SegmentedControl.Root size="sm" fullWidth defaultValue="fit" onValueChange={save} aria-label="Scale">',
      "  <SegmentedControl.Indicator />",
      '  <SegmentedControl.Item value="fit">',
      "    <SegmentedControl.ItemText>Fit</SegmentedControl.ItemText>",
      "    <SegmentedControl.ItemHiddenInput />",
      "  </SegmentedControl.Item>",
      "</SegmentedControl.Root>",
      "",
      '[data-scope="segment-group"][data-part="indicator"] { background-color: var(--accent); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<SegmentedControl.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="segment-group"][data-part="thumb"] { background-color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"thumb" is not a real part of SegmentedControl');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { SegmentGroup } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { SegmentedControl } from "@moderno-ui/react"');
  });
});
