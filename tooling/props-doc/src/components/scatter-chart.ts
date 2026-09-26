import { CHART_FRAME_PARTS } from "../chart-frame-parts.ts";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "ScatterChart",
  slug: "scatter-chart",
  scope: "chart",
  props: { file: "src/charts.tsx", type: "ScatterChartProps" },
  parts: CHART_FRAME_PARTS.concat({ name: "point" }),
  examples: {
    react: [
      {
        title: "Scatter plot",
        code: [
          'import { ScatterChart } from "@moderno-ui/react";',
          "",
          "const series = [",
          '  { name: "Samples", points: [{ x: 0, y: 12 }, { x: 1, y: 28 }, { x: 2, y: 22 }] },',
          "];",
          "",
          "<ScatterChart width={520} height={260} series={series} radius={4} />",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Scatter plot",
        code: [
          '<script setup lang="ts">',
          'import { ScatterChart } from "@moderno-ui/vue";',
          "",
          "const series = [",
          '  { name: "Samples", points: [{ x: 0, y: 12 }, { x: 1, y: 28 }, { x: 2, y: 22 }] },',
          "];",
          "</script>",
          "",
          "<template>",
          '  <ScatterChart :width="520" :height="260" :series="series" :radius="4" />',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Scatter plot",
        code: [
          '<script lang="ts">',
          '  import { ScatterChart } from "@moderno-ui/svelte";',
          "",
          "  const series = [",
          '    { name: "Samples", points: [{ x: 0, y: 12 }, { x: 1, y: 28 }, { x: 2, y: 22 }] },',
          "  ];",
          "</script>",
          "",
          "<ScatterChart width={520} height={260} {series} radius={4} />",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Scatter plot",
        code: [
          'import { ScatterChart } from "@moderno-ui/solid";',
          "",
          "const series = [",
          '  { name: "Samples", points: [{ x: 0, y: 12 }, { x: 1, y: 28 }, { x: 2, y: 22 }] },',
          "];",
          "",
          "function SamplesChart() {",
          "  return <ScatterChart width={520} height={260} series={series} radius={4} />;",
          "}",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
