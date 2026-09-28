import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on AngleSlider", () => {
  it("accepts real AngleSlider usage and knows its Ark anatomy", () => {
    const code = [
      'import { AngleSlider } from "@moderno-ui/react";',
      "",
      '<AngleSlider.Root size="lg" defaultValue={90} marks={[0, 90, 180, 270]}>',
      "  <AngleSlider.Label>Rotation</AngleSlider.Label>",
      "  <AngleSlider.Control>",
      "    <AngleSlider.Thumb />",
      "    <AngleSlider.MarkerGroup>",
      "      <AngleSlider.Marker value={90} />",
      "    </AngleSlider.MarkerGroup>",
      "  </AngleSlider.Control>",
      "  <AngleSlider.Input />",
      "  <AngleSlider.HiddenInput />",
      "</AngleSlider.Root>",
      "",
      '[data-scope="angle-slider"][data-part="marker"][data-state="at-value"] { color: var(--primary); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<AngleSlider.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="angle-slider"][data-part="needle"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"needle" is not a real part of AngleSlider');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { AngleSlider } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { AngleSlider } from "@moderno-ui/react"');
  });
});
