<!--
  Checkbox across its three states, its sizes and the disabled affordance —
  @moderno-ui/vue, the same demo every framework's example shows.
-->
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
    <Checkbox.Root disabled default-checked>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
        <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Disabled</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
  </div>
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
