<script setup lang="ts">
import { RadioGroup } from "@moderno-ui/vue";

const speeds = [
  { value: "standard", label: "Standard", description: "3–5 business days" },
  { value: "express", label: "Express", description: "1–2 business days" },
  { value: "overnight", label: "Overnight", description: "Next business day" },
];
</script>

<template>
  <RadioGroup.Root default-value="standard">
    <RadioGroup.Label>Shipping</RadioGroup.Label>
    <RadioGroup.Item v-for="speed in speeds" :key="speed.value" :value="speed.value">
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>
        {{ speed.label }}
        <RadioGroup.ItemDescription>{{ speed.description }}</RadioGroup.ItemDescription>
      </RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
</template>
