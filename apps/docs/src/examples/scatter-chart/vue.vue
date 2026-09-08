<!--
  ScatterChart — pure SVG over @moderno-ui/charts-core; colour comes from the
  `--chart-*` token slots via the series index, nothing baked in here.
-->
<script setup lang="ts">
import { ScatterChart } from "@moderno-ui/vue";

const series = [
  {
    name: "Samples",
    points: [
      { x: 0, y: 12 },
      { x: 1, y: 28 },
      { x: 2, y: 22 },
      { x: 3, y: 40 },
      { x: 4, y: 18 },
      { x: 5, y: 34 },
    ],
  },
];
</script>

<template>
  <ScatterChart :width="520" :height="260" :series="series" :radius="4" />
</template>
