<script setup lang="ts">
import { ColorPicker } from "@moderno-ui/vue";

const brand = ["#EF4444", "#F59E0B", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899"];
</script>

<template>
  <ColorPicker default-value="#3B82F6" :swatches="brand" />
</template>
