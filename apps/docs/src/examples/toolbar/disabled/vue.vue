<script setup lang="ts">
import { Toolbar } from "@moderno-ui/vue";

const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
} as const;
</script>

<template>
  <Toolbar.Root aria-label="History">
    <Toolbar.Button label="Undo" shortcut="⌘Z">
      <svg v-bind="svg"><path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>
    </Toolbar.Button>
    <Toolbar.Button label="Redo" shortcut="⇧⌘Z" disabled>
      <svg v-bind="svg"><path d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></svg>
    </Toolbar.Button>
  </Toolbar.Root>
</template>
