<script setup lang="ts">
import { BarList } from "@moderno-ui/vue";

const pages = [
  { name: "/", value: 1240 },
  { name: "/pricing", value: 860 },
  { name: "/docs", value: 540 },
  { name: "/blog", value: 320 },
  { name: "/careers", value: 110 },
];
</script>

<template>
  <BarList :width="420" :data="pages" aria-label="Visits by page" />
</template>
