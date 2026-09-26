import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on PinInput", () => {
  it("accepts a real PinInput usage and its own data-part overrides", () => {
    const code = [
      'import { PinInput } from "@moderno-ui/react";',
      "",
      '<PinInput.Root count={6} otp size="lg">',
      "  <PinInput.Control>",
      "    <PinInput.Input index={0} />",
      "  </PinInput.Control>",
      "</PinInput.Root>",
      "",
      '[data-scope="pin-input"][data-part="control"] { gap: var(--spacing-3); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);
  });

  it("flags a data-part the PinInput anatomy doesn't have", () => {
    const { findings } = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="pin-input"][data-part="cell"] { color: var(--foreground); }',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "moderno/valid-data-part-override" });
    expect(findings[0]!.message).toContain('"cell" is not a real part of PinInput');
  });
});
