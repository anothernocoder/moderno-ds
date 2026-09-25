<script setup lang="ts">
import { Checkbox } from "@moderno-ui/vue";
</script>

<template>
  <Checkbox.Root invalid>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
</template>
