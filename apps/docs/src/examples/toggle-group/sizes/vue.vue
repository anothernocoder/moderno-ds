<script setup lang="ts">
import { ToggleGroup } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <ToggleGroup.Root
      size="sm"
      variant="outline"
      :default-value="['week']"
      aria-label="Small period"
    >
      <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
      <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
    </ToggleGroup.Root>
    <ToggleGroup.Root
      size="md"
      variant="outline"
      :default-value="['week']"
      aria-label="Medium period"
    >
      <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
      <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
    </ToggleGroup.Root>
    <ToggleGroup.Root
      size="lg"
      variant="outline"
      :default-value="['week']"
      aria-label="Large period"
    >
      <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
      <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
    </ToggleGroup.Root>
  </div>
</template>
