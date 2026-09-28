<script setup lang="ts">
import { VectorPad } from "@moderno-ui/vue";
</script>

<template>
  <VectorPad.Root>
    <VectorPad.Label>Offset</VectorPad.Label>
    <VectorPad.Control>
      <VectorPad.Thumb />
    </VectorPad.Control>
    <VectorPad.Input axis="x" />
    <VectorPad.Input axis="y" />
  </VectorPad.Root>
</template>
