<script setup lang="ts">
import { SegmentedControl } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-stack">
    <SegmentedControl.Root full-width default-value="yearly" aria-label="Billing">
      <SegmentedControl.Indicator />
      <SegmentedControl.Item value="monthly">
        <SegmentedControl.ItemText>Monthly</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="yearly">
        <SegmentedControl.ItemText>Yearly</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  </div>
</template>
