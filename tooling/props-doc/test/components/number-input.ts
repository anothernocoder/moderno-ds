import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** NumberInput's recipe prop, size and Ark parts. */
export default function expectNumberInput(numberInput: AgentComponent): void {
  expect(numberInput.scope).toBe("number-input");
  expect(numberInput.props.map((p) => p.name)).toEqual(["size"]);
  expect(numberInput.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(numberInput.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "control",
    "input",
    "decrement-trigger",
    "increment-trigger",
    "scrubber",
    "value-text",
  ]);
  // Ark's own Root props (value, min, max, step, …) live under node_modules.
  expect(numberInput.propsComplete).toBe(false);
}
