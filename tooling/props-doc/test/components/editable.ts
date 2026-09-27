import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Editable's own props, its size recipe and Ark's parts. */
export default function expectEditable(editable: AgentComponent): void {
  expect(editable.scope).toBe("editable");
  expect(editable.props.map((p) => p.name).sort()).toEqual(["activationMode", "size"]);
  expect(editable.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(editable.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "area",
    "preview",
    "input",
    "control",
    "edit-trigger",
    "submit-trigger",
    "cancel-trigger",
  ]);
  // Ark's own Root props (value, submitMode, placeholder, …) live under node_modules.
  expect(editable.propsComplete).toBe(false);
}
