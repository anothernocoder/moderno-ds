<script setup lang="ts">
import { ToggleGroup } from "@moderno-ui/vue";
</script>

<template>
  <ToggleGroup.Root :default-value="['left']" aria-label="Text alignment">
    <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
    <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
    <ToggleGroup.Item value="right" disabled>Right</ToggleGroup.Item>
  </ToggleGroup.Root>
</template>
