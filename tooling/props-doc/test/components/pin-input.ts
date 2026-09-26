import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** PinInput's props, resolved from the canonical react source, and its recipe's variants. */
export default function expectPinInput(pinInput: AgentComponent): void {
  // Ark's own Root props (count, mask, otp, …) are inherited from
  // node_modules and stay out of the table; only what Moderno declares.
  expect(pinInput.props.map((p) => p.name)).toEqual(["size"]);
  expect(pinInput.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(pinInput.propsComplete).toBe(false);
}
