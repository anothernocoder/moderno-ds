import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** RadioGroup's recipe prop, variants and parts — what validate_usage checks against. */
export default function expectRadioGroup(radioGroup: AgentComponent): void {
  expect(radioGroup.scope).toBe("radio-group");
  expect(radioGroup.props.map((p) => p.name)).toEqual(["size"]);
  expect(radioGroup.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(radioGroup.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "item",
    "item-control",
    "item-text",
    "item-description",
    "indicator",
  ]);
  // Ark's own Root props (value, orientation, onValueChange, …) live under node_modules.
  expect(radioGroup.propsComplete).toBe(false);
}
