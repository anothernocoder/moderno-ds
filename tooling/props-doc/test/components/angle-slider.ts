import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** AngleSlider's own props, its size recipe and Ark's parts. */
export default function expectAngleSlider(angleSlider: AgentComponent): void {
  expect(angleSlider.scope).toBe("angle-slider");
  expect(angleSlider.props.map((p) => p.name).sort()).toEqual([
    "getAriaValueText",
    "marks",
    "onValueChange",
    "onValueChangeEnd",
    "size",
  ]);
  expect(angleSlider.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(angleSlider.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "control",
    "thumb",
    "marker-group",
    "marker",
    "value-text",
  ]);
  // Ark's own Root props (value, step, disabled, …) live under node_modules.
  expect(angleSlider.propsComplete).toBe(false);
}
