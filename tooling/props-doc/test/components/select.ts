import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Select's props, resolved from the canonical react source, and its recipe's variants. */
export default function expectSelect(select: AgentComponent): void {
  expect(select.props.map((p) => p.name)).toEqual(["size"]);
  expect(select.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(select.propsComplete).toBe(false);
}
