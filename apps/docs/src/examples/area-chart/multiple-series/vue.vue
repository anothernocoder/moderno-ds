<!--
  Two overlapping series; each fills from `--chart-1…5` by its index at
  a low opacity, so the one behind stays readable — @moderno-ui/vue.
-->
<script setup lang="ts">
import { AreaChart } from "@moderno-ui/vue";

const series = [
  {
    name: "Revenue",
    points: [
      { x: 0, y: 8 },
      { x: 1, y: 14 },
      { x: 2, y: 11 },
      { x: 3, y: 20 },
      { x: 4, y: 18 },
      { x: 5, y: 26 },
    ],
  },
  {
    name: "Costs",
    points: [
      { x: 0, y: 5 },
      { x: 1, y: 9 },
      { x: 2, y: 8 },
      { x: 3, y: 12 },
      { x: 4, y: 11 },
      { x: 5, y: 15 },
    ],
  },
];
</script>

<template>
  <AreaChart :width="520" :height="260" :series="series" :x-ticks="6" :y-ticks="5" />
</template>
