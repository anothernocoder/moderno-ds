<script setup lang="ts">
import { RadioGroup } from "@moderno-ui/vue";

const periods = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];
</script>

<template>
  <RadioGroup.Root orientation="horizontal" default-value="monthly">
    <RadioGroup.Label>Billing</RadioGroup.Label>
    <RadioGroup.Item v-for="period in periods" :key="period.value" :value="period.value">
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>{{ period.label }}</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
</template>
