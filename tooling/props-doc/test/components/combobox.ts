import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Combobox's recipe prop, size and Ark parts. */
export default function expectCombobox(combobox: AgentComponent): void {
  expect(combobox.scope).toBe("combobox");
  expect(combobox.props.map((p) => p.name)).toEqual(["size"]);
  expect(combobox.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(combobox.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "control",
    "input",
    "trigger",
    "clear-trigger",
    "positioner",
    "content",
    "list",
    "item-group",
    "item-group-label",
    "item",
    "item-text",
    "item-indicator",
    "empty",
  ]);
  // Ark's own Root props (collection, multiple, value, …) live under node_modules.
  expect(combobox.propsComplete).toBe(false);
}
