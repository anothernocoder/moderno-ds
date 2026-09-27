import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** ColorPicker's own props, recipe and parts — what validate_usage checks against. */
export default function expectColorPicker(colorPicker: AgentComponent): void {
  expect(colorPicker.scope).toBe("color-picker");
  expect(colorPicker.props.map((p) => p.name).sort()).toEqual([
    "alpha",
    "defaultValue",
    "name",
    "onValueChange",
    "portalled",
    "size",
    "swatches",
    "translations",
    "value",
  ]);
  expect(colorPicker.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(colorPicker.parts.map((p) => p.name)).toEqual([
    "root",
    "control",
    "trigger",
    "swatch",
    "value-text",
    "positioner",
    "content",
    "area",
    "area-background",
    "area-thumb",
    "channel-slider",
    "channel-slider-track",
    "channel-slider-thumb",
    "hex-input",
    "eye-dropper-trigger",
    "swatch-group",
    "swatch-trigger",
  ]);
  // Ark's own Root props (open, positioning, disabled, …) live under node_modules.
  expect(colorPicker.propsComplete).toBe(false);
}
