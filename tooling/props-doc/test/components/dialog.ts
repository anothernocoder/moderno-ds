import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Dialog has empty props — it adds none of its own. */
export default function expectDialog(dialog: AgentComponent): void {
  expect(dialog.props).toEqual([]);
  expect(dialog.variants).toBeUndefined();
}
