/**
 * The documented-component manifest: which components get a PropsTable and
 * where each props interface lives, resolved from the canonical
 * `@moderno/react` types (props are identical across bindings by contract —
 * they share the `@moderno/core` recipes).
 *
 * `test/manifest.test.ts` resolves every entry against the real react
 * tsconfig, so a renamed export or moved file fails in tests, not at docs
 * build time. A new Primitive is documented by adding one entry here.
 */
import type { ComponentEntry } from "./index.ts";

/** Components with consumer-authored props worth a table. */
export const ENTRIES: ComponentEntry[] = [
  { name: "Button", file: "src/button.tsx", type: "ButtonProps" },
  { name: "Select", file: "src/select.tsx", type: "ModernoSelectRootProps" },
  { name: "LineChart", file: "src/charts.tsx", type: "LineChartProps" },
  { name: "AreaChart", file: "src/charts.tsx", type: "AreaChartProps" },
  { name: "BarChart", file: "src/charts.tsx", type: "BarChartProps" },
  { name: "ScatterChart", file: "src/charts.tsx", type: "ScatterChartProps" },
];
