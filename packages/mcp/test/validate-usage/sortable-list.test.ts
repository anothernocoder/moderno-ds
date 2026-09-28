import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on SortableList", () => {
  it("accepts real SortableList usage and knows its anatomy", () => {
    const code = [
      'import { SortableList } from "@moderno-ui/react";',
      "",
      '<SortableList.Root items={order} onReorder={(e) => setOrder(e.items)} aria-label="Slides">',
      '  <SortableList.Item value="logo" label="Logo">',
      "    <SortableList.ItemHandle />",
      "    <SortableList.ItemTrigger>Logo</SortableList.ItemTrigger>",
      "  </SortableList.Item>",
      "</SortableList.Root>",
      "",
      '[data-scope="sortable-list"][data-part="item"][data-dragging] { box-shadow: var(--shadow-md); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="sortable-list"][data-part="handle"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"handle" is not a real part of SortableList');
  });
});
