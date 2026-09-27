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
  <DonutChart
    :width="240"
    :height="240"
    :data="data"
    :pad-angle="0.03"
    aria-label="Traffic by source"
  />
</template>
