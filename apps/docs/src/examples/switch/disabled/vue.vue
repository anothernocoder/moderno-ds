<script setup lang="ts">
import { Switch } from "@moderno-ui/vue";
</script>

<template>
  <Switch.Root disabled default-checked>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label>Sync over mobile data</Switch.Label>
    <Switch.HiddenInput />
  </Switch.Root>
</template>
