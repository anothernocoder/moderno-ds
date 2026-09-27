<script setup lang="ts">
import { Menu, Portal } from "@moderno-ui/vue";
</script>

<template>
  <Menu.Root>
    <Menu.ContextTrigger>Right-click here</Menu.ContextTrigger>
    <Portal>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item value="cut">Cut</Menu.Item>
          <Menu.Item value="copy">Copy</Menu.Item>
          <Menu.Item value="paste">Paste</Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Portal>
  </Menu.Root>
</template>
