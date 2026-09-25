<!--
  PinInput at its three sizes, side by side — size on PinInput.Root sizes
  every cell — @moderno-ui/vue.
-->
<script setup lang="ts">
import { PinInput } from "@moderno-ui/vue";

const cells = [0, 1, 2, 3];
</script>

<template>
  <div class="demo-row">
    <PinInput.Root :count="cells.length" size="sm">
      <PinInput.Label>Small</PinInput.Label>
      <PinInput.Control>
        <PinInput.Input v-for="index in cells" :key="index" :index="index" />
      </PinInput.Control>
    </PinInput.Root>
    <PinInput.Root :count="cells.length" size="md">
      <PinInput.Label>Medium</PinInput.Label>
      <PinInput.Control>
        <PinInput.Input v-for="index in cells" :key="index" :index="index" />
      </PinInput.Control>
    </PinInput.Root>
    <PinInput.Root :count="cells.length" size="lg">
      <PinInput.Label>Large</PinInput.Label>
      <PinInput.Control>
        <PinInput.Input v-for="index in cells" :key="index" :index="index" />
      </PinInput.Control>
    </PinInput.Root>
  </div>
</template>
