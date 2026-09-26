import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Badge's props — what validate_usage checks against. */
export default function expectBadge(badge: AgentComponent): void {
  expect(badge.scope).toBe("badge");
  expect(badge.props.map((p) => p.name).sort()).toEqual(["dot", "size", "variant"]);
  expect(badge.variants?.variant).toContain("warning");
  expect(badge.parts.map((p) => p.name)).toEqual(["root", "dot"]);
  expect(badge.propsComplete).toBe(true);
}
