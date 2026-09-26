<script setup lang="ts">
import { NumberInput } from "@moderno-ui/vue";
</script>

<template>
  <NumberInput.Root default-value="320" :min="0">
    <NumberInput.Label>Width</NumberInput.Label>
    <NumberInput.Control>
      <NumberInput.Scrubber aria-hidden="true">↔</NumberInput.Scrubber>
      <NumberInput.Input />
      <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
      <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
</template>
