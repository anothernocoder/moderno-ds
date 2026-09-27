import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Menu's recipe prop, size, and Ark parts. */
export default function expectMenu(menu: AgentComponent): void {
  expect(menu.scope).toBe("menu");
  expect(menu.props.map((p) => p.name)).toEqual(["size"]);
  expect(menu.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(menu.parts.map((p) => p.name)).toEqual([
    "trigger",
    "indicator",
    "context-trigger",
    "positioner",
    "content",
    "arrow",
    "arrow-tip",
    "item",
    "item-text",
    "item-indicator",
    "item-group",
    "item-group-label",
    "separator",
    "trigger-item",
  ]);
  // Ark's own Root props (open, onSelect, positioning, …) live under node_modules.
  expect(menu.propsComplete).toBe(false);
}
