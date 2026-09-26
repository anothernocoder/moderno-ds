import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Field's props, resolved from the canonical react source, and its recipe's variants. */
export default function expectField(field: AgentComponent): void {
  expect(field.props.map((p) => p.name)).toEqual(["size"]);
  expect(field.variants).toEqual({ size: ["sm", "md", "lg"] });
}
