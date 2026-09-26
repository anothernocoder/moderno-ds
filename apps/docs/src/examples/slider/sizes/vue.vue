<script setup lang="ts">
import { Slider } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-stack">
    <Slider.Root size="sm" :default-value="[25]">
      <Slider.Label>Small</Slider.Label>
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
    <Slider.Root size="md" :default-value="[50]">
      <Slider.Label>Medium</Slider.Label>
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
    <Slider.Root size="lg" :default-value="[75]">
      <Slider.Label>Large</Slider.Label>
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
  </div>
</template>
