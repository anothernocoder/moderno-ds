<script setup lang="ts">
import { NumberInput } from "@moderno-ui/vue";
</script>

<template>
  <NumberInput.Root default-value="8" :min="1" :max="8">
    <NumberInput.Label>Guests</NumberInput.Label>
    <NumberInput.Control>
      <NumberInput.Input />
      <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
      <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
</template>
