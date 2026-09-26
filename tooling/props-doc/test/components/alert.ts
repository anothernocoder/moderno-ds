import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Alert's props, statuses and full anatomy — what validate_usage checks against. */
export default function expectAlert(alert: AgentComponent): void {
  expect(alert.scope).toBe("alert");
  expect(alert.props.map((p) => p.name).sort()).toEqual(["size", "variant"]);
  expect(alert.variants).toEqual({
    variant: ["info", "success", "warning", "error"],
    size: ["sm", "md"],
  });
  expect(alert.parts.map((p) => p.name)).toEqual([
    "root",
    "icon",
    "content",
    "title",
    "description",
    "action",
  ]);
}
