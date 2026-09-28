import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on VectorPad", () => {
  it("accepts real VectorPad usage and knows its anatomy", () => {
    const code = [
      'import { VectorPad } from "@moderno-ui/react";',
      "",
      '<VectorPad.Root size="lg" min={0} max={100} defaultValue={{ x: 50, y: 50 }} invertY>',
      "  <VectorPad.Label>Focal point</VectorPad.Label>",
      "  <VectorPad.Control>",
      "    <VectorPad.Grid />",
      "    <VectorPad.Crosshair />",
      "    <VectorPad.Thumb />",
      "  </VectorPad.Control>",
      '  <VectorPad.Input axis="x" />',
      '  <VectorPad.Input axis="y" />',
      "</VectorPad.Root>",
      "",
      '[data-scope="vector-pad"][data-part="thumb"][data-dragging] { border-color: var(--ring); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<VectorPad.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="vector-pad"][data-part="handle"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"handle" is not a real part of VectorPad');
  });
});
