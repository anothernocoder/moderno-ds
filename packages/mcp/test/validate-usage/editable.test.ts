import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Editable", () => {
  it("accepts real Editable usage and knows its Ark anatomy", () => {
    const code = [
      'import { Editable } from "@moderno-ui/react";',
      "",
      '<Editable.Root size="sm" defaultValue="Background" activationMode="dblclick">',
      "  <Editable.Label>Layer name</Editable.Label>",
      "  <Editable.Area>",
      "    <Editable.Input />",
      "    <Editable.Preview />",
      "  </Editable.Area>",
      "  <Editable.Control>",
      "    <Editable.EditTrigger>Edit</Editable.EditTrigger>",
      "    <Editable.SubmitTrigger>Save</Editable.SubmitTrigger>",
      "    <Editable.CancelTrigger>Cancel</Editable.CancelTrigger>",
      "  </Editable.Control>",
      "</Editable.Root>",
      "",
      '[data-scope="editable"][data-part="preview"][data-placeholder-shown] { color: var(--muted-foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Editable.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="editable"][data-part="text"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"text" is not a real part of Editable');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Editable } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Editable } from "@moderno-ui/react"');
  });
});
