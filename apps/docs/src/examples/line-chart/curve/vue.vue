<!--
  The same series drawn through a monotone curve instead of straight
  segments; the curve factory comes from charts-core — @moderno-ui/vue.
-->
<script setup lang="ts">
import { LineChart } from "@moderno-ui/vue";
import { curveMonotoneX } from "@moderno-ui/charts-core";

const series = [
  {
    name: "Sessions",
    points: [
      { x: 0, y: 12 },
      { x: 1, y: 28 },
      { x: 2, y: 22 },
      { x: 3, y: 40 },
      { x: 4, y: 36 },
      { x: 5, y: 54 },
    ],
  },
];
</script>

<template>
  <LineChart
    :width="520"
    :height="260"
    :series="series"
    :x-ticks="6"
    :y-ticks="5"
    :curve="curveMonotoneX"
  />
</template>
