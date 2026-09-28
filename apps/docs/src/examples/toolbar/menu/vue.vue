<script setup lang="ts">
import { Menu, Portal, Toolbar } from "@moderno-ui/vue";

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
  <Toolbar.Root aria-label="Layer tools">
    <Toolbar.Button label="Duplicate" shortcut="⌘D">
      <svg v-bind="svg"><path d="M8 8h12v12H8zM4 16V4h12" /></svg>
    </Toolbar.Button>
    <Menu.Root>
      <Menu.Trigger as-child>
        <Toolbar.Button label="More">
          <svg v-bind="svg">
            <path
              d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0M18 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0"
            />
          </svg>
        </Toolbar.Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="rename">Rename</Menu.Item>
            <Menu.Item value="export">Export</Menu.Item>
            <Menu.Item value="delete">Delete</Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  </Toolbar.Root>
</template>
