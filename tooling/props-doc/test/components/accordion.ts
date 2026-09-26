import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Accordion's recipe props, variants and Ark parts. */
export default function expectAccordion(accordion: AgentComponent): void {
  expect(accordion.scope).toBe("accordion");
  expect(accordion.props.map((p) => p.name)).toEqual(["size", "variant"]);
  expect(accordion.variants).toEqual({
    variant: ["line", "enclosed"],
    size: ["sm", "md", "lg"],
  });
  expect(accordion.parts.map((p) => p.name)).toEqual([
    "root",
    "item",
    "item-trigger",
    "item-indicator",
    "item-content",
  ]);
  // Ark's own Root props (value, multiple, collapsible, …) live under node_modules.
  expect(accordion.propsComplete).toBe(false);
}
