<script setup lang="ts">
import { DonutChart } from "@moderno-ui/vue";

const data = [
  { name: "Direct", value: 456 },
  { name: "Search", value: 351 },
  { name: "Referral", value: 271 },
  { name: "Social", value: 120 },
];
</script>

<template>
  <DonutChart :width="240" :height="240" :data="data" aria-label="Traffic by source" />
</template>
