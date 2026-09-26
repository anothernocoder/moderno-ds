import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Checkbox's props, resolved from the canonical react source, and its recipe's variants. */
export default function expectCheckbox(checkbox: AgentComponent): void {
  expect(checkbox.props.map((p) => p.name)).toEqual(["size"]);
  expect(checkbox.variants).toEqual({ size: ["sm", "md", "lg"] });
}
