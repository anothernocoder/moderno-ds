<script setup lang="ts">
import { ref } from "vue";
import { Toolbar } from "@moderno-ui/vue";

const zoom = ref(100);

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
  <Toolbar.Root aria-label="Zoom">
    <Toolbar.Button label="Zoom out" @click="zoom = Math.max(25, zoom - 25)">
      <svg v-bind="svg"><path d="M5 12h14" /></svg>
    </Toolbar.Button>
    <span aria-live="polite">{{ zoom }}%</span>
    <Toolbar.Button label="Zoom in" @click="zoom = Math.min(400, zoom + 25)">
      <svg v-bind="svg"><path d="M5 12h14M12 5v14" /></svg>
    </Toolbar.Button>
  </Toolbar.Root>
</template>
