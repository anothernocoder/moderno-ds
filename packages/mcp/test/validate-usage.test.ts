/**
 * `validate_usage` as a whole: the rules it runs together on one snippet. Each
 * primitive's own cases live beside this file, in `validate-usage/<slug>.test.ts`.
 */
import { describe, expect, it } from "vitest";
import { ModernoMcpError } from "../src/tools/shared.ts";
import { validateUsage } from "../src/tools/validate-usage.ts";
import { useConsumerManifests } from "./helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage", () => {
  it("catches a hardcoded color, an invalid prop, and a raw-Ark import in one snippet (issue #43 AC)", () => {
    const code = [
      'import { Dialog } from "@ark-ui/react";',
      '<Button variant="primaryy" style={{ color: "#ff0000" }}>Save</Button>',
    ].join("\n");
    const { findings } = validateUsage(manifests(), { code, framework: "react" });
    expect(findings.map((f) => f.ruleId).sort()).toEqual([
      "moderno/no-hardcoded-color",
      "moderno/no-raw-ark",
      "moderno/valid-props",
    ]);
  });

  it("flags a data-part override that doesn't exist on the target primitive (issue #43 AC)", () => {
    const { findings } = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="dialog"][data-part="header"] { color: var(--foreground); }',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "moderno/valid-data-part-override" });
  });

  it("flags a hand-rolled reimplementation of an existing primitive (issue #43 AC)", () => {
    const { findings } = validateUsage(manifests(), {
      framework: "react",
      code: '<dialog role="dialog">...</dialog>',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "moderno/no-reimplemented-primitive",
      severity: "warn",
    });
  });

  it("returns no findings for clean, valid usage", () => {
    const { findings } = validateUsage(manifests(), {
      framework: "react",
      code: '<Button variant="primary">Save</Button>',
    });
    expect(findings).toHaveLength(0);
  });

  it("accepts a compound primitive's props on its Root, and catches a wrong one", () => {
    const valid = validateUsage(manifests(), {
      framework: "react",
      code: [
        '<Card.Root variant="outline" size="md">',
        "  <Card.Header>",
        "    <Card.Title>Monthly report</Card.Title>",
        "    <Card.Description>Revenue across every channel.</Card.Description>",
        "  </Card.Header>",
        "  <Card.Content>Up 12% on last month.</Card.Content>",
        "  <Card.Footer>Export</Card.Footer>",
        "</Card.Root>",
      ].join("\n"),
    });
    expect(valid.findings).toHaveLength(0);

    const invalid = validateUsage(manifests(), {
      framework: "react",
      code: '<Card.Root elevation="high">…</Card.Root>',
    });
    expect(invalid.findings).toHaveLength(1);
    expect(invalid.findings[0]).toMatchObject({ ruleId: "moderno/valid-props" });
  });

  it("throws a ModernoMcpError for a framework that isn't installed", () => {
    expect(() => validateUsage(manifests(), { code: "<Button />", framework: "solid" })).toThrow(
      ModernoMcpError,
    );
  });
});
