import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** VectorPad's machine props from core, its size recipe and its own parts. */
export default function expectVectorPad(vectorPad: AgentComponent): void {
  expect(vectorPad.scope).toBe("vector-pad");
  expect(vectorPad.props.map((p) => p.name).sort()).toEqual([
    "aria-label",
    "aria-labelledby",
    "defaultValue",
    "disabled",
    "getAriaValueText",
    "id",
    "ids",
    "invalid",
    "invertY",
    "max",
    "min",
    "onValueChange",
    "onValueChangeEnd",
    "readOnly",
    "size",
    "step",
    "value",
  ]);
  expect(vectorPad.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(vectorPad.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "control",
    "grid",
    "crosshair",
    "thumb",
  ]);
  // Zag's shared props (dir, getRootNode) live under node_modules.
  expect(vectorPad.propsComplete).toBe(false);
}
