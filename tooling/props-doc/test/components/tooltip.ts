import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Tooltip's recipe prop, size, and Ark's parts (the Root renders no element). */
export default function expectTooltip(tooltip: AgentComponent): void {
  expect(tooltip.scope).toBe("tooltip");
  expect(tooltip.props.map((p) => p.name)).toEqual(["size"]);
  expect(tooltip.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(tooltip.parts.map((p) => p.name)).toEqual([
    "trigger",
    "positioner",
    "content",
    "arrow",
    "arrow-tip",
  ]);
  // Ark's own Root props (openDelay, positioning, open, …) live under node_modules.
  expect(tooltip.propsComplete).toBe(false);
}
