<script setup lang="ts">
import { AngleSlider } from "@moderno-ui/vue";

const marks = [0, 45, 90, 135, 180, 225, 270, 315];
</script>

<template>
  <AngleSlider.Root :default-value="90" :marks="marks">
    <AngleSlider.Label>Gradient direction</AngleSlider.Label>
    <AngleSlider.Control>
      <AngleSlider.Thumb />
      <AngleSlider.MarkerGroup>
        <AngleSlider.Marker v-for="mark in marks" :key="mark" :value="mark" />
      </AngleSlider.MarkerGroup>
    </AngleSlider.Control>
    <AngleSlider.Input />
    <AngleSlider.HiddenInput />
  </AngleSlider.Root>
</template>
