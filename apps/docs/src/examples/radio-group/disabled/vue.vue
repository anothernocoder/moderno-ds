<script setup lang="ts">
import { RadioGroup } from "@moderno-ui/vue";

const options = [
  { value: "courier", label: "Courier" },
  { value: "pickup", label: "Store pickup", disabled: true },
];
</script>

<template>
  <RadioGroup.Root default-value="courier">
    <RadioGroup.Label>Delivery</RadioGroup.Label>
    <RadioGroup.Item
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
    >
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>{{ option.label }}</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
</template>
