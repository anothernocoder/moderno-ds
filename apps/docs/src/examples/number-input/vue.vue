<script setup lang="ts">
import { NumberInput } from "@moderno-ui/vue";
</script>

<template>
  <NumberInput.Root default-value="1" :min="1" :max="10">
    <NumberInput.Label>Quantity</NumberInput.Label>
    <NumberInput.Control>
      <NumberInput.Input />
      <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
      <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
</template>
