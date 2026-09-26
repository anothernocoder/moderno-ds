import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Skeleton's props — what validate_usage checks against. */
export default function expectSkeleton(skeleton: AgentComponent): void {
  expect(skeleton.scope).toBe("skeleton");
  expect(skeleton.props.map((p) => p.name)).toEqual(["shape"]);
  expect(skeleton.variants).toEqual({ shape: ["text", "rect", "circle"] });
  expect(skeleton.parts.map((p) => p.name)).toEqual(["root"]);
}
