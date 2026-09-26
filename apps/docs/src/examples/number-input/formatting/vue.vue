<script setup lang="ts">
import { NumberInput } from "@moderno-ui/vue";
</script>

<template>
  <NumberInput.Root
    default-value="1250"
    :step="50"
    :format-options="{ style: 'currency', currency: 'USD' }"
  >
    <NumberInput.Label>Price</NumberInput.Label>
    <NumberInput.Control>
      <NumberInput.Input />
      <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
      <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
</template>
