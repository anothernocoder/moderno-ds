import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Drawer's recipe prop, placement, and Ark's Dialog parts under its own scope. */
export default function expectDrawer(drawer: AgentComponent): void {
  expect(drawer.scope).toBe("drawer");
  expect(drawer.props.map((p) => p.name)).toEqual(["placement"]);
  expect(drawer.variants).toEqual({ placement: ["left", "right", "top", "bottom"] });
  expect(drawer.parts.map((p) => p.name)).toEqual([
    "trigger",
    "backdrop",
    "positioner",
    "content",
    "title",
    "description",
    "close-trigger",
  ]);
  // Ark's own Dialog Root props (open, modal, closeOnEscape, …) live under node_modules.
  expect(drawer.propsComplete).toBe(false);
}
