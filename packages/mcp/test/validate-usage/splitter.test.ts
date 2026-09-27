import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Splitter", () => {
  it("accepts real Splitter usage and knows its Ark anatomy", () => {
    const code = [
      'import { Splitter } from "@moderno-ui/react";',
      "",
      "<Splitter.Root",
      '  variant="enclosed"',
      '  orientation="vertical"',
      '  panels={[{ id: "code" }, { id: "console", minSize: 20, collapsible: true }]}',
      "  defaultSize={[75, 25]}",
      ">",
      '  <Splitter.Panel id="code">Code</Splitter.Panel>',
      '  <Splitter.ResizeTrigger id="code:console" aria-label="Resize code and console">',
      "    <Splitter.ResizeTriggerIndicator />",
      "  </Splitter.ResizeTrigger>",
      '  <Splitter.Panel id="console">Console</Splitter.Panel>',
      "</Splitter.Root>",
      "",
      '[data-scope="splitter"][data-part="resize-trigger"][data-dragging] { color: var(--primary); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badVariant = validateUsage(manifests(), {
      framework: "react",
      code: '<Splitter.Root variant="outline" />',
    }).findings;
    expect(badVariant).toHaveLength(1);
    expect(badVariant[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badVariant[0]!.message).toContain("line, enclosed");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="splitter"][data-part="handle"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"handle" is not a real part of Splitter');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Splitter } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Splitter } from "@moderno-ui/react"');
  });
});
