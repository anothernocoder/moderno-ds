<script setup lang="ts">
import { Checkbox } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <Checkbox.Root>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
        <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Unchecked</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
    <Checkbox.Root default-checked>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
        <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Checked</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
    <Checkbox.Root default-checked="indeterminate">
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
        <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Indeterminate</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
  </div>
</template>
