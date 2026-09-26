<script setup lang="ts">
import { Switch } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <Switch.Root size="sm" default-checked>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Small</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
    <Switch.Root size="md" default-checked>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Medium</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
    <Switch.Root size="lg" default-checked>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Large</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
  </div>
</template>
