<script setup lang="ts">
import { ToggleGroup } from "@moderno-ui/vue";
</script>

<template>
  <ToggleGroup.Root :default-value="['center']" aria-label="Text alignment">
    <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
    <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
    <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
  </ToggleGroup.Root>
</template>
