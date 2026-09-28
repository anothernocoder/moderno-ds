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
  <Toolbar.Root aria-label="Drawing tools" orientation="vertical">
    <Toolbar.Button label="Select" shortcut="V">
      <svg v-bind="svg"><path d="m4 4 7 17 2.5-7.5L21 11z" /></svg>
    </Toolbar.Button>
    <Toolbar.Button label="Pen" shortcut="P">
      <svg v-bind="svg"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
    </Toolbar.Button>
    <Toolbar.Button label="Shape" shortcut="R">
      <svg v-bind="svg">
        <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      </svg>
    </Toolbar.Button>
    <Toolbar.Button label="Text" shortcut="T">
      <svg v-bind="svg"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
    </Toolbar.Button>
  </Toolbar.Root>
</template>
