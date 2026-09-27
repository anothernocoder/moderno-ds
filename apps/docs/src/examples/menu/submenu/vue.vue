<script setup lang="ts">
import { Menu, Portal } from "@moderno-ui/vue";
</script>

<template>
  <Menu.Root>
    <Menu.Trigger>Actions <Menu.Indicator>▾</Menu.Indicator></Menu.Trigger>
    <Portal>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item value="edit">Edit</Menu.Item>
          <Menu.Item value="duplicate">Duplicate</Menu.Item>
          <Menu.Root>
            <Menu.TriggerItem><Menu.ItemText>Share</Menu.ItemText>›</Menu.TriggerItem>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="email">Email</Menu.Item>
                  <Menu.Item value="copy-link">Copy link</Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Menu.Content>
      </Menu.Positioner>
    </Portal>
  </Menu.Root>
</template>
