import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** LineChart shares the chart scope and frame, has no CVA variants, and owns its whole API. */
export default function expectLineChart(chart: AgentComponent): void {
  expect(chart.scope).toBe("chart");
  expect(chart.variants).toBeUndefined();
  expect(chart.parts.map((p) => p.name)).toEqual([
    "root",
    "grid",
    "grid-line",
    "axis-line",
    "tick-label",
    "series",
    "line",
  ]);
  expect(chart.propsComplete).toBe(true);
}
