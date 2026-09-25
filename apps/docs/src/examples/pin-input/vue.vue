<!--
  A six-digit one-time code at the default size; the hidden input carries
  the joined code into a form — @moderno-ui/vue.
-->
<script setup lang="ts">
import { PinInput } from "@moderno-ui/vue";

const cells = [0, 1, 2, 3, 4, 5];
</script>

<template>
  <PinInput.Root :count="cells.length" otp>
    <PinInput.Label>Verification code</PinInput.Label>
    <PinInput.Control>
      <PinInput.Input v-for="index in cells" :key="index" :index="index" />
    </PinInput.Control>
    <PinInput.HiddenInput />
  </PinInput.Root>
</template>
