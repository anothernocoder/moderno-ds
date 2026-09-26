<script setup lang="ts">
import { RadioGroup } from "@moderno-ui/vue";

const sizes = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
] as const;
</script>

<template>
  <div class="demo-row">
    <RadioGroup.Root v-for="size in sizes" :key="size.value" :size="size.value" default-value="yes">
      <RadioGroup.Label>{{ size.label }}</RadioGroup.Label>
      <RadioGroup.Item value="yes">
        <RadioGroup.ItemControl />
        <RadioGroup.ItemText>Yes</RadioGroup.ItemText>
        <RadioGroup.ItemHiddenInput />
      </RadioGroup.Item>
      <RadioGroup.Item value="no">
        <RadioGroup.ItemControl />
        <RadioGroup.ItemText>No</RadioGroup.ItemText>
        <RadioGroup.ItemHiddenInput />
      </RadioGroup.Item>
    </RadioGroup.Root>
  </div>
</template>
