import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Popover's recipe prop, size and Ark parts. */
export default function expectPopover(popover: AgentComponent): void {
  expect(popover.scope).toBe("popover");
  expect(popover.props.map((p) => p.name)).toEqual(["size"]);
  expect(popover.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(popover.parts.map((p) => p.name)).toEqual([
    "trigger",
    "indicator",
    "anchor",
    "positioner",
    "content",
    "arrow",
    "arrow-tip",
    "title",
    "description",
    "close-trigger",
  ]);
  // Ark's own Root props (open, positioning, modal, …) live under node_modules.
  expect(popover.propsComplete).toBe(false);
}
