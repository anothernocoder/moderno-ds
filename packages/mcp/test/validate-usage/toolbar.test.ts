import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Toolbar", () => {
  it("accepts real Toolbar usage and knows its parts", () => {
    const code = [
      'import { Toolbar } from "@moderno-ui/react";',
      "",
      '<Toolbar.Root aria-label="Canvas tools" size="sm">',
      '  <Toolbar.Button label="Undo" shortcut="⌘Z" onClick={undo}>',
      "    <UndoIcon />",
      "  </Toolbar.Button>",
      "  <Toolbar.Separator />",
      '  <Toolbar.Group aria-label="Text style">',
      '    <Toolbar.Toggle label="Bold" pressed={bold} onPressedChange={setBold}>',
      "      <BoldIcon />",
      "    </Toolbar.Toggle>",
      "  </Toolbar.Group>",
      "</Toolbar.Root>",
      "",
      '[data-scope="toolbar"][data-part="toggle"][data-state="on"] { color: var(--accent-foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Toolbar.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="toolbar"][data-part="item"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"item" is not a real part of Toolbar');
  });
});
