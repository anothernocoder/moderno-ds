import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Progress", () => {
  it("accepts real Progress usage and knows its Ark anatomy", () => {
    const code = [
      'import { Progress } from "@moderno-ui/react";',
      "",
      '<Progress.Root size="sm" value={40}>',
      "  <Progress.Label>Uploading</Progress.Label>",
      "  <Progress.ValueText />",
      "  <Progress.Track>",
      "    <Progress.Range />",
      "  </Progress.Track>",
      "</Progress.Root>",
      "",
      "<Progress.Root value={null}>",
      "  <Progress.Circle>",
      "    <Progress.CircleTrack />",
      "    <Progress.CircleRange />",
      "  </Progress.Circle>",
      "</Progress.Root>",
      "",
      '[data-scope="progress"][data-part="range"][data-state="complete"] { background-color: var(--success); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Progress.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="progress"][data-part="bar"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"bar" is not a real part of Progress');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Progress } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Progress } from "@moderno-ui/react"');
  });
});
