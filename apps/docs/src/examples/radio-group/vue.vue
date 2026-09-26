<script setup lang="ts">
import { RadioGroup } from "@moderno-ui/vue";

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
];
</script>

<template>
  <RadioGroup.Root default-value="pro">
    <RadioGroup.Label>Plan</RadioGroup.Label>
    <RadioGroup.Item v-for="plan in plans" :key="plan.value" :value="plan.value">
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>{{ plan.label }}</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
</template>
