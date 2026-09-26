import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Divider's recipe props, variants and styled parts. */
export default function expectDivider(divider: AgentComponent): void {
  expect(divider.props.map((p) => p.name)).toEqual(["align", "orientation"]);
  expect(divider.variants).toEqual({
    orientation: ["horizontal", "vertical"],
    align: ["start", "center", "end"],
  });
  expect(divider.parts.map((p) => p.name)).toEqual(["root", "label"]);
  expect(divider.propsComplete).toBe(true);
}
