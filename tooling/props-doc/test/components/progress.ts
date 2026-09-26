import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Progress's recipe prop, size and Ark parts. */
export default function expectProgress(progress: AgentComponent): void {
  expect(progress.scope).toBe("progress");
  expect(progress.props.map((p) => p.name)).toEqual(["size"]);
  expect(progress.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(progress.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "value-text",
    "track",
    "range",
    "circle",
    "circle-track",
    "circle-range",
    "view",
  ]);
  // Ark's own Root props (value, min, max, …) live under node_modules.
  expect(progress.propsComplete).toBe(false);
}
