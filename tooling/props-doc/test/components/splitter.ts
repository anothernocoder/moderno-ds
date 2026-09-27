import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Splitter's recipe prop, variant and Ark parts. */
export default function expectSplitter(splitter: AgentComponent): void {
  expect(splitter.scope).toBe("splitter");
  // No `size` of Moderno's own: Ark's Root takes `size` for the panel sizes.
  expect(splitter.props.map((p) => p.name)).toEqual(["variant"]);
  expect(splitter.variants).toEqual({ variant: ["line", "enclosed"] });
  expect(splitter.parts.map((p) => p.name)).toEqual([
    "root",
    "panel",
    "resize-trigger",
    "resize-trigger-indicator",
  ]);
  // Ark's own Root props (panels, defaultSize, orientation, …) live under node_modules.
  expect(splitter.propsComplete).toBe(false);
}
