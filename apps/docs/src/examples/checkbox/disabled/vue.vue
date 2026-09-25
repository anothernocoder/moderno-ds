<!--
  A disabled, checked Checkbox — inert, and dimmed across every part —
  @moderno-ui/vue.
-->
<script setup lang="ts">
import { Checkbox } from "@moderno-ui/vue";
</script>

<template>
  <Checkbox.Root disabled default-checked>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Share usage analytics</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
</template>
