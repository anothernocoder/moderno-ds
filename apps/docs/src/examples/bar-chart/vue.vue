<!--
  One bar per category on a band scale; its colour comes from the
  `--chart-1` token slot, nothing baked in here — @moderno-ui/vue.
-->
<script setup lang="ts">
import { BarChart } from "@moderno-ui/vue";

const categories = ["Q1", "Q2", "Q3", "Q4"];
const series = [{ name: "Revenue", values: [8, 14, 11, 20] }];
</script>

<template>
  <BarChart :width="520" :height="260" :categories="categories" :series="series" :y-ticks="5" />
</template>
