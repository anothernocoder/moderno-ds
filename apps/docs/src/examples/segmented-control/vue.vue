<script setup lang="ts">
import { SegmentedControl } from "@moderno-ui/vue";
</script>

<template>
  <SegmentedControl.Root default-value="fill" aria-label="Image scale">
    <SegmentedControl.Indicator />
    <SegmentedControl.Item value="fit">
      <SegmentedControl.ItemText>Fit</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
    <SegmentedControl.Item value="fill">
      <SegmentedControl.ItemText>Fill</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
    <SegmentedControl.Item value="stretch">
      <SegmentedControl.ItemText>Stretch</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
  </SegmentedControl.Root>
</template>
