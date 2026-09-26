<script setup lang="ts">
import { NumberInput } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-stack">
    <NumberInput.Root size="sm" default-value="1">
      <NumberInput.Label>Small</NumberInput.Label>
      <NumberInput.Control>
        <NumberInput.Input />
        <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
        <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
    <NumberInput.Root size="md" default-value="2">
      <NumberInput.Label>Medium</NumberInput.Label>
      <NumberInput.Control>
        <NumberInput.Input />
        <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
        <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
    <NumberInput.Root size="lg" default-value="3">
      <NumberInput.Label>Large</NumberInput.Label>
      <NumberInput.Control>
        <NumberInput.Input />
        <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
        <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
  </div>
</template>
