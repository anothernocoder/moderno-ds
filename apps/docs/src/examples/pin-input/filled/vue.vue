<!--
  Filled cells tint toward the primary colour; once every cell holds a
  character the whole code turns primary — @moderno-ui/vue.
-->
<script setup lang="ts">
import { PinInput } from "@moderno-ui/vue";

const cells = [0, 1, 2, 3];
</script>

<template>
  <div class="demo-row">
    <PinInput.Root :count="cells.length" :default-value="['4', '2']">
      <PinInput.Label>Partly filled</PinInput.Label>
      <PinInput.Control>
        <PinInput.Input v-for="index in cells" :key="index" :index="index" />
      </PinInput.Control>
    </PinInput.Root>
    <PinInput.Root :count="cells.length" :default-value="['4', '2', '1', '7']">
      <PinInput.Label>Complete</PinInput.Label>
      <PinInput.Control>
        <PinInput.Input v-for="index in cells" :key="index" :index="index" />
      </PinInput.Control>
    </PinInput.Root>
  </div>
</template>
