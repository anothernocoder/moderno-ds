<script setup lang="ts">
import { ToggleGroup } from "@moderno-ui/vue";
</script>

<template>
  <ToggleGroup.Root
    orientation="vertical"
    variant="outline"
    :default-value="['middle']"
    aria-label="Vertical alignment"
  >
    <ToggleGroup.Item value="top">Top</ToggleGroup.Item>
    <ToggleGroup.Item value="middle">Middle</ToggleGroup.Item>
    <ToggleGroup.Item value="bottom">Bottom</ToggleGroup.Item>
  </ToggleGroup.Root>
</template>
