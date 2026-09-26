<script setup lang="ts">
import { RadioGroup } from "@moderno-ui/vue";

const methods = [
  { value: "card", label: "Card" },
  { value: "transfer", label: "Bank transfer" },
];
</script>

<template>
  <RadioGroup.Root invalid>
    <RadioGroup.Label>Payment method</RadioGroup.Label>
    <RadioGroup.Item v-for="method in methods" :key="method.value" :value="method.value">
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>{{ method.label }}</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
</template>
