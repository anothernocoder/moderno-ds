<script setup lang="ts">
import { Switch } from "@moderno-ui/vue";
</script>

<template>
  <Switch.Root>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label>Email notifications</Switch.Label>
    <Switch.HiddenInput />
  </Switch.Root>
</template>
