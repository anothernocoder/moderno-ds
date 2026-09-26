<script setup lang="ts">
import { Switch } from "@moderno-ui/vue";
</script>

<template>
  <Switch.Root invalid>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label>Share my location</Switch.Label>
    <Switch.HiddenInput />
  </Switch.Root>
</template>
