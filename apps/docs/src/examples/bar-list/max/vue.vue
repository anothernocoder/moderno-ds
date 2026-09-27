<script setup lang="ts">
import { BarList } from "@moderno-ui/vue";

const teams = [
  { name: "Design", value: 82 },
  { name: "Engineering", value: 64 },
  { name: "Marketing", value: 45 },
  { name: "Sales", value: 30 },
];
const format = (value: number) => `${value}%`;
</script>

<template>
  <BarList
    :width="420"
    :data="teams"
    :max="100"
    :format="format"
    aria-label="Goal progress by team"
  />
</template>
