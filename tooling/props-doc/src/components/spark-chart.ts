import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "SparkChart",
  slug: "spark-chart",
  scope: "chart",
  props: { file: "src/spark-chart.tsx", type: "SparkChartProps" },
  // No frame: a spark is one series with its line, an optional fill and an
  // optional last-point marker (`sparkChartNodes` in charts-core).
  parts: [
    { name: "root" },
    { name: "series" },
    { name: "area" },
    { name: "line" },
    { name: "point" },
  ],
  examples: {
    react: [
      {
        title: "Sparkline",
        code: [
          'import { SparkChart } from "@moderno-ui/react";',
          "",
          "const points = [{ x: 0, y: 12 }, { x: 1, y: 18 }, { x: 2, y: 15 }, { x: 3, y: 24 }];",
          "",
          '<SparkChart points={points} area showLastPoint aria-label="Visits, last 4 days" />',
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Sparkline",
        code: [
          '<script setup lang="ts">',
          'import { SparkChart } from "@moderno-ui/vue";',
          "",
          "const points = [{ x: 0, y: 12 }, { x: 1, y: 18 }, { x: 2, y: 15 }, { x: 3, y: 24 }];",
          "</script>",
          "",
          "<template>",
          '  <SparkChart :points="points" area show-last-point aria-label="Visits, last 4 days" />',
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Sparkline",
        code: [
          '<script lang="ts">',
          '  import { SparkChart } from "@moderno-ui/svelte";',
          "",
          "  const points = [{ x: 0, y: 12 }, { x: 1, y: 18 }, { x: 2, y: 15 }, { x: 3, y: 24 }];",
          "</script>",
          "",
          '<SparkChart {points} area showLastPoint aria-label="Visits, last 4 days" />',
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Sparkline",
        code: [
          'import { SparkChart } from "@moderno-ui/solid";',
          "",
          "const points = [{ x: 0, y: 12 }, { x: 1, y: 18 }, { x: 2, y: 15 }, { x: 3, y: 24 }];",
          "",
          "function VisitsTrend() {",
          '  return <SparkChart points={points} area showLastPoint aria-label="Visits, last 4 days" />;',
          "}",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
