<script setup lang="ts">
import { PinInput } from "@moderno-ui/vue";

const cells = [0, 1, 2, 3, 4, 5];
</script>

<template>
  <PinInput.Root :count="cells.length" type="alphanumeric">
    <PinInput.Label>Recovery code</PinInput.Label>
    <PinInput.Control>
      <PinInput.Input v-for="index in cells" :key="index" :index="index" />
    </PinInput.Control>
  </PinInput.Root>
</template>
