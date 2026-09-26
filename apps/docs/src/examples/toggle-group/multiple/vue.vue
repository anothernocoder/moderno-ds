<script setup lang="ts">
import { ToggleGroup } from "@moderno-ui/vue";
</script>

<template>
  <ToggleGroup.Root multiple :default-value="['bold']" aria-label="Text style">
    <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
    <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
    <ToggleGroup.Item value="underline">Underline</ToggleGroup.Item>
  </ToggleGroup.Root>
</template>
