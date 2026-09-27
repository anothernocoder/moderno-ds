import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** DonutChart shares the chart scope but not the Cartesian frame, has no CVA variants, and owns its whole API. */
export default function expectDonutChart(chart: AgentComponent): void {
  expect(chart.scope).toBe("chart");
  expect(chart.variants).toBeUndefined();
  expect(chart.parts.map((p) => p.name)).toEqual(["root", "series", "slice"]);
  expect(chart.props.map((p) => p.name).sort()).toEqual(
    ["data", "height", "innerRadius", "padAngle", "width"].sort(),
  );
  expect(chart.propsComplete).toBe(true);
}
