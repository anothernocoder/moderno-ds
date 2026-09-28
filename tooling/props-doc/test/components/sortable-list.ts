import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** SortableList's own props (the machine's plus the size recipe) and its four parts. */
export default function expectSortableList(list: AgentComponent): void {
  expect(list.scope).toBe("sortable-list");
  expect(list.props.map((p) => p.name).sort()).toEqual([
    "children",
    "defaultItems",
    "disabled",
    "items",
    "onReorder",
    "size",
    "translations",
  ]);
  expect(list.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(list.parts.map((p) => p.name)).toEqual(["root", "item", "item-handle", "item-trigger"]);
  // No Ark root: SortableList declares its whole API itself.
  expect(list.propsComplete).toBe(true);
}
