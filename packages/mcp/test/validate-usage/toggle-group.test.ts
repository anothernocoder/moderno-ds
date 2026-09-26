import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on ToggleGroup", () => {
  it("accepts real ToggleGroup usage and knows its Ark anatomy", () => {
    const code = [
      'import { ToggleGroup } from "@moderno-ui/react";',
      "",
      '<ToggleGroup.Root variant="outline" multiple defaultValue={["bold"]} aria-label="Text style">',
      '  <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>',
      '  <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>',
      "</ToggleGroup.Root>",
      "",
      '[data-scope="toggle-group"][data-part="item"][data-state="on"] { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="toggle-group"][data-part="button"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"button" is not a real part of ToggleGroup');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { ToggleGroup } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { ToggleGroup } from "@moderno-ui/react"');
  });
});
