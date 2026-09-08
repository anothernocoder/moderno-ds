<!--
  PinInput across its three sizes plus the invalid state — @moderno-ui/vue,
  the same demo every framework's example shows.
-->
<script setup lang="ts">
import { PinInput } from "@moderno-ui/vue";

const cells = [0, 1, 2, 3, 4, 5];
const smallCells = [0, 1, 2, 3];
</script>

<template>
  <div class="demo-row">
    <PinInput.Root :count="cells.length" otp size="md">
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Control>
        <PinInput.Input v-for="index in cells" :key="index" :index="index" />
      </PinInput.Control>
      <PinInput.HiddenInput />
    </PinInput.Root>
  </div>

  <div class="demo-row">
    <PinInput.Root :count="4" size="sm" :default-value="['1', '2', '3', '4']">
      <PinInput.Label>Small, complete</PinInput.Label>
      <PinInput.Control>
        <PinInput.Input v-for="index in smallCells" :key="index" :index="index" />
      </PinInput.Control>
    </PinInput.Root>

    <PinInput.Root :count="4" size="lg" mask>
      <PinInput.Label>Large, masked</PinInput.Label>
      <PinInput.Control>
        <PinInput.Input v-for="index in smallCells" :key="index" :index="index" />
      </PinInput.Control>
    </PinInput.Root>

    <PinInput.Root :count="4" invalid :default-value="['9', '9', '9', '9']">
      <PinInput.Label>Invalid</PinInput.Label>
      <PinInput.Control>
        <PinInput.Input v-for="index in smallCells" :key="index" :index="index" />
      </PinInput.Control>
    </PinInput.Root>
  </div>
</template>
