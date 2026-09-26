import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Indicator's props — what validate_usage checks against. */
export default function expectIndicator(indicator: AgentComponent): void {
  // `pulse` is a real prop but not a recipe variant, so it is in `props` and
  // absent from `variants`: the enum check has nothing to gate it against.
  expect(indicator.scope).toBe("indicator");
  expect(indicator.props.map((p) => p.name).sort()).toEqual(["pulse", "size", "variant"]);
  expect(indicator.variants).toEqual({
    variant: ["neutral", "info", "success", "warning", "error"],
    size: ["sm", "md"],
  });
  expect(indicator.parts.map((p) => p.name)).toEqual(["root", "dot", "label"]);
}
