<script setup lang="ts">
import { AngleSlider } from "@moderno-ui/vue";
</script>

<template>
  <AngleSlider.Root :default-value="90" :step="15">
    <AngleSlider.Label>Direction</AngleSlider.Label>
    <AngleSlider.Control>
      <AngleSlider.Thumb />
    </AngleSlider.Control>
    <AngleSlider.Input />
    <AngleSlider.HiddenInput />
  </AngleSlider.Root>
</template>
