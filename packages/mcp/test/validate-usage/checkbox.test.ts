import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Checkbox", () => {
  it("accepts a Checkbox's own props and parts, and steers raw Ark to the wrapper", () => {
    // The manifest knows Checkbox (props + variants + parts), so real usage is
    // clean while the off-contract moves around it are still caught.
    expect(
      validateUsage(manifests(), {
        framework: "react",
        code: '<Checkbox size="md">Email me updates</Checkbox>',
      }).findings,
    ).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Checkbox size="huge" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="checkbox"][data-part="box"] { color: var(--foreground); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]).toMatchObject({ ruleId: "moderno/valid-data-part-override" });
    expect(badPart[0]!.message).toContain("root, control, indicator, label");

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Checkbox } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Checkbox } from "@moderno-ui/react"');
  });
});
