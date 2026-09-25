<!--
  An invalid PinInput — every cell switches to the destructive border —
  @moderno-ui/vue.
-->
<script setup lang="ts">
import { PinInput } from "@moderno-ui/vue";

const cells = [0, 1, 2, 3];
</script>

<template>
  <PinInput.Root :count="cells.length" invalid :default-value="['9', '9', '9', '9']">
    <PinInput.Label>Verification code</PinInput.Label>
    <PinInput.Control>
      <PinInput.Input v-for="index in cells" :key="index" :index="index" />
    </PinInput.Control>
  </PinInput.Root>
</template>
