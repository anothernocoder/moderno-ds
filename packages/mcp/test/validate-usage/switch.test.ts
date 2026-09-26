import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Switch", () => {
  it("accepts a real Switch usage and knows its Ark anatomy", () => {
    const code = [
      'import { Switch } from "@moderno-ui/react";',
      "",
      '<Switch.Root size="sm" defaultChecked onCheckedChange={save}>',
      "  <Switch.Control>",
      "    <Switch.Thumb />",
      "  </Switch.Control>",
      "  <Switch.Label>Email notifications</Switch.Label>",
      "  <Switch.HiddenInput />",
      "</Switch.Root>",
      "",
      '[data-scope="switch"][data-part="thumb"] { box-shadow: var(--shadow-md); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Switch.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="switch"][data-part="track"] { background: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"track" is not a real part of Switch');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Switch } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Switch } from "@moderno-ui/react"');
  });
});
