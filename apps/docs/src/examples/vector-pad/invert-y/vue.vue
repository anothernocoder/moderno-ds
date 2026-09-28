<script setup lang="ts">
import { VectorPad } from "@moderno-ui/vue";
</script>

<template>
  <VectorPad.Root :min="0" :max="100" :default-value="{ x: 30, y: 20 }" invert-y>
    <VectorPad.Label>Focal point</VectorPad.Label>
    <VectorPad.Control>
      <VectorPad.Grid />
      <VectorPad.Crosshair />
      <VectorPad.Thumb />
    </VectorPad.Control>
    <VectorPad.Input axis="x" />
    <VectorPad.Input axis="y" />
  </VectorPad.Root>
</template>
