import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** SegmentedControl's recipe props, variants and parts — what validate_usage checks against. */
export default function expectSegmentedControl(segmentedControl: AgentComponent): void {
  // Ark's anatomy names the scope: its SegmentGroup stamps "segment-group".
  expect(segmentedControl.scope).toBe("segment-group");
  // `fullWidth` is a real prop but not a recipe variant, so it is in `props`
  // and absent from `variants`.
  expect(segmentedControl.props.map((p) => p.name).sort()).toEqual(["fullWidth", "size"]);
  expect(segmentedControl.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(segmentedControl.parts.map((p) => p.name)).toEqual([
    "root",
    "indicator",
    "item",
    "item-text",
  ]);
  // Ark's own Root props (value, onValueChange, disabled, …) live under node_modules.
  expect(segmentedControl.propsComplete).toBe(false);
}
