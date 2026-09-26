import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Avatar", () => {
  it("accepts a real Avatar usage and knows its Ark anatomy", () => {
    const code = [
      'import { Avatar } from "@moderno-ui/react";',
      "",
      '<Avatar.Root size="lg" shape="square">',
      "  <Avatar.Fallback>AL</Avatar.Fallback>",
      '  <Avatar.Image src="/ada.png" alt="Ada Lovelace" />',
      "</Avatar.Root>",
      "",
      '[data-scope="avatar"][data-part="fallback"] { font-weight: var(--font-weight-semibold); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badShape = validateUsage(manifests(), {
      framework: "react",
      code: '<Avatar.Root shape="rounded" />',
    }).findings;
    expect(badShape).toHaveLength(1);
    expect(badShape[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badShape[0]!.message).toContain("circle, square");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="avatar"][data-part="initials"] { color: var(--foreground); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"initials" is not a real part of Avatar');
  });
});
