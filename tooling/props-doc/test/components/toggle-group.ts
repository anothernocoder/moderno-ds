import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** ToggleGroup's recipe props, variants and Ark parts. */
export default function expectToggleGroup(group: AgentComponent): void {
  expect(group.scope).toBe("toggle-group");
  expect(group.props.map((p) => p.name)).toEqual(["size", "variant"]);
  expect(group.variants).toEqual({ variant: ["ghost", "outline"], size: ["sm", "md", "lg"] });
  expect(group.parts.map((p) => p.name)).toEqual(["root", "item"]);
  // Ark's own Root props (value, multiple, …) live under node_modules.
  expect(group.propsComplete).toBe(false);
}
