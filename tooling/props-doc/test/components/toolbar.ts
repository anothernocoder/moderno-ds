import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Toolbar's own root props, its size recipe and the machine's parts. */
export default function expectToolbar(toolbar: AgentComponent): void {
  expect(toolbar.scope).toBe("toolbar");
  expect(toolbar.props.map((p) => p.name).sort()).toEqual(["dir", "orientation", "size"]);
  expect(toolbar.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(toolbar.parts.map((p) => p.name)).toEqual([
    "root",
    "button",
    "toggle",
    "group",
    "separator",
  ]);
  // The machine is ours, so the root's props are all here: nothing hides under node_modules.
  expect(toolbar.propsComplete).toBe(true);
}
