import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Slider", () => {
  it("accepts real Slider usage and knows its Ark anatomy", () => {
    const code = [
      'import { Slider } from "@moderno-ui/react";',
      "",
      '<Slider.Root size="sm" defaultValue={[20, 80]}>',
      "  <Slider.Label>Price</Slider.Label>",
      "  <Slider.ValueText />",
      "  <Slider.Control>",
      "    <Slider.Track>",
      "      <Slider.Range />",
      "    </Slider.Track>",
      "    <Slider.Thumb index={0}>",
      "      <Slider.HiddenInput />",
      "    </Slider.Thumb>",
      "    <Slider.Thumb index={1}>",
      "      <Slider.HiddenInput />",
      "    </Slider.Thumb>",
      "  </Slider.Control>",
      "  <Slider.MarkerGroup>",
      "    <Slider.Marker value={50}>50</Slider.Marker>",
      "  </Slider.MarkerGroup>",
      "</Slider.Root>",
      "",
      '[data-scope="slider"][data-part="marker"][data-state="at-value"] { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Slider.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="slider"][data-part="handle"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"handle" is not a real part of Slider');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Slider } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Slider } from "@moderno-ui/react"');
  });
});
