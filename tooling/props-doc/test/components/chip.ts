import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Chip's props — what validate_usage checks against. */
export default function expectChip(chip: AgentComponent): void {
  expect(chip.scope).toBe("chip");
  expect(chip.props.map((p) => p.name).sort()).toEqual([
    "onRemove",
    "removable",
    "removeLabel",
    "size",
    "variant",
  ]);
  expect(chip.parts.map((p) => p.name)).toEqual(["root", "label", "remove-trigger"]);
}
