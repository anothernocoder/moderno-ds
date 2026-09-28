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
  <Toolbar.Root aria-label="Canvas tools">
    <Toolbar.Button label="Undo" shortcut="⌘Z">
      <svg v-bind="svg"><path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>
    </Toolbar.Button>
    <Toolbar.Button label="Redo" shortcut="⇧⌘Z">
      <svg v-bind="svg"><path d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></svg>
    </Toolbar.Button>
    <Toolbar.Separator />
    <Toolbar.Group aria-label="Text style">
      <Toolbar.Toggle label="Bold" shortcut="⌘B" default-pressed>
        <svg v-bind="svg">
          <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
        </svg>
      </Toolbar.Toggle>
      <Toolbar.Toggle label="Italic" shortcut="⌘I">
        <svg v-bind="svg"><path d="M19 4h-9M14 20H5M15 4 9 20" /></svg>
      </Toolbar.Toggle>
    </Toolbar.Group>
    <Toolbar.Separator />
    <Toolbar.Button label="Zoom out">
      <svg v-bind="svg"><path d="M5 12h14" /></svg>
    </Toolbar.Button>
    <span>100%</span>
    <Toolbar.Button label="Zoom in">
      <svg v-bind="svg"><path d="M5 12h14M12 5v14" /></svg>
    </Toolbar.Button>
  </Toolbar.Root>
</template>
