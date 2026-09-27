<script setup lang="ts">
import { SegmentedControl } from "@moderno-ui/vue";
</script>

<template>
  <SegmentedControl.Root default-value="left" aria-label="Text alignment">
    <SegmentedControl.Indicator />
    <SegmentedControl.Item value="left">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 6H3M15 12H3M17 18H3" />
      </svg>
      <SegmentedControl.ItemText hidden>Align left</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
    <SegmentedControl.Item value="center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 6H3M17 12H7M19 18H5" />
      </svg>
      <SegmentedControl.ItemText hidden>Align center</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
    <SegmentedControl.Item value="right">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 6H3M21 12H9M21 18H7" />
      </svg>
      <SegmentedControl.ItemText hidden>Align right</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
  </SegmentedControl.Root>
</template>
