import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { discoverManifests, type AggregatedManifests } from "@moderno-ui/lint-core";
import { ModernoMcpError } from "../src/tools/shared.ts";
import { validateUsage } from "../src/tools/validate-usage.ts";
import {
  createConsumerFixture,
  type ConsumerFixture,
} from "../../lint-core/test/helpers/consumer-fixture.ts";

let fixture: ConsumerFixture;
let manifests: AggregatedManifests;

beforeAll(() => {
  fixture = createConsumerFixture();
  manifests = discoverManifests(fixture.dir);
});

afterAll(() => {
  fixture.cleanup();
});

describe("validateUsage", () => {
  it("catches a hardcoded color, an invalid prop, and a raw-Ark import in one snippet (issue #43 AC)", () => {
    const code = [
      'import { Dialog } from "@ark-ui/react";',
      '<Button variant="primaryy" style={{ color: "#ff0000" }}>Save</Button>',
    ].join("\n");
    const { findings } = validateUsage(manifests, { code, framework: "react" });
    expect(findings.map((f) => f.ruleId).sort()).toEqual([
      "moderno/no-hardcoded-color",
      "moderno/no-raw-ark",
      "moderno/valid-props",
    ]);
  });

  it("flags a data-part override that doesn't exist on the target primitive (issue #43 AC)", () => {
    const { findings } = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="dialog"][data-part="header"] { color: var(--foreground); }',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "moderno/valid-data-part-override" });
  });

  it("flags a hand-rolled reimplementation of an existing primitive (issue #43 AC)", () => {
    const { findings } = validateUsage(manifests, {
      framework: "react",
      code: '<dialog role="dialog">...</dialog>',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "moderno/no-reimplemented-primitive",
      severity: "warn",
    });
  });

  it("accepts a Checkbox's own props and parts, and steers raw Ark to the wrapper", () => {
    // The manifest knows Checkbox (props + variants + parts), so real usage is
    // clean while the off-contract moves around it are still caught.
    expect(
      validateUsage(manifests, {
        framework: "react",
        code: '<Checkbox size="md">Email me updates</Checkbox>',
      }).findings,
    ).toHaveLength(0);

    const badSize = validateUsage(manifests, {
      framework: "react",
      code: '<Checkbox size="huge" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="checkbox"][data-part="box"] { color: var(--foreground); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]).toMatchObject({ ruleId: "moderno/valid-data-part-override" });
    expect(badPart[0]!.message).toContain("root, control, indicator, label");

    const rawArk = validateUsage(manifests, {
      framework: "react",
      code: 'import { Checkbox } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Checkbox } from "@moderno-ui/react"');
  });

  it("returns no findings for clean, valid usage", () => {
    const { findings } = validateUsage(manifests, {
      framework: "react",
      code: '<Button variant="primary">Save</Button>',
    });
    expect(findings).toHaveLength(0);
  });

  it("throws a ModernoMcpError for a framework that isn't installed", () => {
    expect(() => validateUsage(manifests, { code: "<Button />", framework: "solid" })).toThrow(
      ModernoMcpError,
    );
  });
});
