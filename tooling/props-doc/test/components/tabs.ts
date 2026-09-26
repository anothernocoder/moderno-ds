import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Tabs' recipe props, variants and Ark parts. */
export default function expectTabs(tabs: AgentComponent): void {
  expect(tabs.scope).toBe("tabs");
  expect(tabs.props.map((p) => p.name)).toEqual(["size", "variant"]);
  expect(tabs.variants).toEqual({ variant: ["line", "enclosed"], size: ["sm", "md", "lg"] });
  expect(tabs.parts.map((p) => p.name)).toEqual([
    "root",
    "list",
    "trigger",
    "indicator",
    "content",
  ]);
  // Ark's own Root props (value, orientation, activationMode, …) live under node_modules.
  expect(tabs.propsComplete).toBe(false);
}
