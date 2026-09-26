import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Slider's recipe prop, size and Ark parts. */
export default function expectSlider(slider: AgentComponent): void {
  expect(slider.scope).toBe("slider");
  expect(slider.props.map((p) => p.name)).toEqual(["size"]);
  expect(slider.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(slider.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "value-text",
    "control",
    "track",
    "range",
    "thumb",
    "dragging-indicator",
    "marker-group",
    "marker",
  ]);
  // Ark's own Root props (value, min, max, step, …) live under node_modules.
  expect(slider.propsComplete).toBe(false);
}
