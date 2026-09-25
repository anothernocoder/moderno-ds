<!--
  One labelled Checkbox, unchecked, at the default size — @moderno-ui/vue.
-->
<script setup lang="ts">
import { Checkbox } from "@moderno-ui/vue";
</script>

<template>
  <Checkbox.Root>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
</template>
