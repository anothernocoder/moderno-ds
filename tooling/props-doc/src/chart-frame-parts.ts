import type { AgentPart } from "./agent-manifest.ts";

/**
 * Every chart type shares this frame — `frameNodes`/`chartRoot`/`seriesGroup`
 * in `@moderno-ui/charts-core`'s `render.ts` — and adds only its own mark part
 * (`line`, `area`, `bar`, `point`) on top.
 */
export const CHART_FRAME_PARTS: AgentPart[] = [
  { name: "root" },
  { name: "grid" },
  { name: "grid-line" },
  { name: "axis-line" },
  { name: "tick-label" },
  { name: "series" },
];
