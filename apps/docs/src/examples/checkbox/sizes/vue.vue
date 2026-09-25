<script setup lang="ts">
import { Checkbox } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <Checkbox.Root size="sm" default-checked>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Small</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
    <Checkbox.Root size="md" default-checked>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Medium</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
    <Checkbox.Root size="lg" default-checked>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Large</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
  </div>
</template>
