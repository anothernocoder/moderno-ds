import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** TagsInput's recipe prop, size and Ark parts. */
export default function expectTagsInput(tagsInput: AgentComponent): void {
  expect(tagsInput.scope).toBe("tags-input");
  expect(tagsInput.props.map((p) => p.name)).toEqual(["size"]);
  expect(tagsInput.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(tagsInput.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "control",
    "item",
    "item-preview",
    "item-text",
    "item-delete-trigger",
    "item-input",
    "input",
    "clear-trigger",
  ]);
  // Ark's own Root props (value, max, delimiter, …) live under node_modules.
  expect(tagsInput.propsComplete).toBe(false);
}
