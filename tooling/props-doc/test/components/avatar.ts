import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Avatar's recipe props, variants and Ark parts — what validate_usage checks against. */
export default function expectAvatar(avatar: AgentComponent): void {
  expect(avatar.scope).toBe("avatar");
  expect(avatar.props.map((p) => p.name).sort()).toEqual(["shape", "size"]);
  expect(avatar.variants).toEqual({ size: ["sm", "md", "lg"], shape: ["circle", "square"] });
  expect(avatar.parts.map((p) => p.name)).toEqual(["root", "image", "fallback"]);
  // Ark's own Root props (onStatusChange, ids) live under node_modules.
  expect(avatar.propsComplete).toBe(false);
}
