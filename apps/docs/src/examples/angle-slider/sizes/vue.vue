<script setup lang="ts">
import { AngleSlider } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <AngleSlider.Root size="sm" :default-value="30">
      <AngleSlider.Label>Small</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
      </AngleSlider.Control>
      <AngleSlider.Input />
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
    <AngleSlider.Root size="md" :default-value="60">
      <AngleSlider.Label>Medium</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
      </AngleSlider.Control>
      <AngleSlider.Input />
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
    <AngleSlider.Root size="lg" :default-value="90">
      <AngleSlider.Label>Large</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
      </AngleSlider.Control>
      <AngleSlider.Input />
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
  </div>
</template>
