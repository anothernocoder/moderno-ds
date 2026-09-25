<!--
  A masked PinInput — the cells render as password inputs — @moderno-
  ui/vue.
-->
<script setup lang="ts">
import { PinInput } from "@moderno-ui/vue";

const cells = [0, 1, 2, 3];
</script>

<template>
  <PinInput.Root :count="cells.length" mask :default-value="['7', '3']">
    <PinInput.Label>PIN</PinInput.Label>
    <PinInput.Control>
      <PinInput.Input v-for="index in cells" :key="index" :index="index" />
    </PinInput.Control>
  </PinInput.Root>
</template>
