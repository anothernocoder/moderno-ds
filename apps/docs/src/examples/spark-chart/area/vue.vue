<script setup lang="ts">
import { SparkChart } from "@moderno-ui/vue";

const points = [
  { x: 0, y: 12 },
  { x: 1, y: 18 },
  { x: 2, y: 15 },
  { x: 3, y: 24 },
  { x: 4, y: 21 },
  { x: 5, y: 30 },
  { x: 6, y: 27 },
  { x: 7, y: 36 },
];
</script>

<template>
  <SparkChart :points="points" area aria-label="Revenue, last 8 weeks" />
</template>
