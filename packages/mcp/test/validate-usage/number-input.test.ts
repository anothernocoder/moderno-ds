import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on NumberInput", () => {
  it("accepts real NumberInput usage and knows its Ark anatomy", () => {
    const code = [
      'import { NumberInput } from "@moderno-ui/react";',
      "",
      '<NumberInput.Root size="sm" defaultValue="5" min={0} max={10}>',
      "  <NumberInput.Label>Quantity</NumberInput.Label>",
      "  <NumberInput.Control>",
      "    <NumberInput.Input />",
      "    <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>",
      "    <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>",
      "  </NumberInput.Control>",
      "</NumberInput.Root>",
      "",
      '[data-scope="number-input"][data-part="increment-trigger"]:hover { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<NumberInput.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="number-input"][data-part="stepper"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"stepper" is not a real part of NumberInput');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { NumberInput } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { NumberInput } from "@moderno-ui/react"');
  });
});
