<!--
  Wider band padding: half of each category's step is gap, so the
  bars read as slimmer columns — @moderno-ui/vue.
-->
<script setup lang="ts">
import { BarChart } from "@moderno-ui/vue";

const categories = ["Q1", "Q2", "Q3", "Q4"];
const series = [{ name: "Revenue", values: [8, 14, 11, 20] }];
</script>

<template>
  <BarChart
    :width="520"
    :height="260"
    :categories="categories"
    :series="series"
    :y-ticks="5"
    :padding="0.5"
  />
</template>
