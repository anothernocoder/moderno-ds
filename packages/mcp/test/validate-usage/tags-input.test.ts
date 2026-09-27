import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on TagsInput", () => {
  it("accepts real TagsInput usage and knows its Ark anatomy", () => {
    const code = [
      'import { TagsInput } from "@moderno-ui/react";',
      "",
      '<TagsInput.Root size="sm" defaultValue={["react"]} max={5}>',
      "  <TagsInput.Label>Frameworks</TagsInput.Label>",
      "  <TagsInput.Control>",
      "    <TagsInput.Context>",
      "      {(tagsInput) =>",
      "        tagsInput.value.map((value, index) => (",
      "          <TagsInput.Item key={index} index={index} value={value}>",
      "            <TagsInput.ItemPreview>",
      "              <TagsInput.ItemText>{value}</TagsInput.ItemText>",
      "              <TagsInput.ItemDeleteTrigger>×</TagsInput.ItemDeleteTrigger>",
      "            </TagsInput.ItemPreview>",
      "            <TagsInput.ItemInput />",
      "          </TagsInput.Item>",
      "        ))",
      "      }",
      "    </TagsInput.Context>",
      "    <TagsInput.Input />",
      "  </TagsInput.Control>",
      "</TagsInput.Root>",
      "",
      '[data-scope="tags-input"][data-part="item-preview"]:hover { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<TagsInput.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="tags-input"][data-part="tag"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"tag" is not a real part of TagsInput');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { TagsInput } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { TagsInput } from "@moderno-ui/react"');
  });
});
