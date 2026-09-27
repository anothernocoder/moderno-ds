<script setup lang="ts">
import { BarList } from "@moderno-ui/vue";

const sources = [
  { name: "Search", value: 4820 },
  { name: "Direct", value: 2310 },
  { name: "Social", value: 1470 },
  { name: "Email", value: 860 },
  { name: "Referral", value: 540 },
  { name: "Ads", value: 290 },
];
</script>

<template>
  <BarList
    :width="420"
    :data="sources"
    :row-height="24"
    :bar-height="4"
    aria-label="Visits by source"
  />
</template>
