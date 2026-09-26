<script setup lang="ts">
import { Switch } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <Switch.Root>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Off</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
    <Switch.Root default-checked>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>On</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
  </div>
</template>
