import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Switch's recipe prop, variants and Ark parts — what validate_usage checks against. */
export default function expectSwitch(sw: AgentComponent): void {
  expect(sw.scope).toBe("switch");
  expect(sw.props.map((p) => p.name)).toEqual(["size"]);
  expect(sw.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(sw.parts.map((p) => p.name)).toEqual(["root", "control", "thumb", "label"]);
  // Ark's own Root props (checked, onCheckedChange, …) live under node_modules.
  expect(sw.propsComplete).toBe(false);
}
