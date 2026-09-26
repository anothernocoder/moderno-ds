import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Toggle's recipe props, variants and Ark parts. */
export default function expectToggle(toggle: AgentComponent): void {
  expect(toggle.scope).toBe("toggle");
  expect(toggle.props.map((p) => p.name)).toEqual(["size", "variant"]);
  expect(toggle.variants).toEqual({ variant: ["ghost", "outline"], size: ["sm", "md", "lg"] });
  expect(toggle.parts.map((p) => p.name)).toEqual(["root", "indicator"]);
  // Ark's own Root props (pressed, …) live under node_modules.
  expect(toggle.propsComplete).toBe(false);
}
