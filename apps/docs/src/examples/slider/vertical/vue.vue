<script setup lang="ts">
import { Slider } from "@moderno-ui/vue";
</script>

<template>
  <Slider.Root :default-value="[60]" orientation="vertical">
    <Slider.Label>Volume</Slider.Label>
    <Slider.ValueText />
    <Slider.Control>
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb :index="0">
        <Slider.HiddenInput />
      </Slider.Thumb>
    </Slider.Control>
  </Slider.Root>
</template>
