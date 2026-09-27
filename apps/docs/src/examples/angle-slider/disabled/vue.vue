<script setup lang="ts">
import { AngleSlider } from "@moderno-ui/vue";
</script>

<template>
  <AngleSlider.Root :default-value="90" disabled>
    <AngleSlider.Label>Rotation</AngleSlider.Label>
    <AngleSlider.Control>
      <AngleSlider.Thumb />
    </AngleSlider.Control>
    <AngleSlider.Input />
    <AngleSlider.HiddenInput />
  </AngleSlider.Root>
</template>
