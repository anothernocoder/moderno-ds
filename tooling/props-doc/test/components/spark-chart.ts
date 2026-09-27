import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** SparkChart shares the chart scope but not its frame, has no CVA variants, and owns its whole API. */
export default function expectSparkChart(chart: AgentComponent): void {
  expect(chart.scope).toBe("chart");
  expect(chart.variants).toBeUndefined();
  expect(chart.parts.map((p) => p.name)).toEqual(["root", "series", "area", "line", "point"]);
  expect(chart.props.map((p) => p.name).sort()).toEqual(
    ["area", "curve", "height", "points", "showLastPoint", "width", "yDomain"].sort(),
  );
  expect(chart.propsComplete).toBe(true);
}
