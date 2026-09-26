import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Callout's variant and anatomy — what validate_usage checks against. */
export default function expectCallout(callout: AgentComponent): void {
  expect(callout.scope).toBe("callout");
  expect(callout.props.map((p) => p.name)).toEqual(["variant"]);
  expect(callout.variants).toEqual({ variant: ["info", "success", "warning", "error"] });
  expect(callout.parts.map((p) => p.name)).toEqual([
    "root",
    "icon",
    "content",
    "title",
    "description",
  ]);
  expect(callout.propsComplete).toBe(true);
}
