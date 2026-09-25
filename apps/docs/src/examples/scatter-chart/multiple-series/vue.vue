<script setup lang="ts">
import { ScatterChart } from "@moderno-ui/vue";

const series = [
  {
    name: "Group A",
    points: [
      { x: 1, y: 8 },
      { x: 1.5, y: 12 },
      { x: 2, y: 10 },
      { x: 2.5, y: 15 },
      { x: 3, y: 13 },
      { x: 3.5, y: 18 },
    ],
  },
  {
    name: "Group B",
    points: [
      { x: 4, y: 30 },
      { x: 4.5, y: 26 },
      { x: 5, y: 34 },
      { x: 5.5, y: 31 },
      { x: 6, y: 38 },
      { x: 6.5, y: 35 },
    ],
  },
];
</script>

<template>
  <ScatterChart :width="520" :height="260" :series="series" />
</template>
