import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** BarList shares the chart scope but no frame, has no CVA variants, and owns its whole API. */
export default function expectBarList(list: AgentComponent): void {
  expect(list.scope).toBe("chart");
  expect(list.variants).toBeUndefined();
  expect(list.parts.map((p) => p.name)).toEqual([
    "root",
    "series",
    "row",
    "label",
    "track",
    "bar",
    "value",
  ]);
  expect(list.props.map((p) => p.name)).toEqual(
    expect.arrayContaining(["width", "data", "max", "sort", "format"]),
  );
  expect(list.propsComplete).toBe(true);
}
