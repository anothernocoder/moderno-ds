<script setup lang="ts">
import { ref } from "vue";
import { Menu, Portal } from "@moderno-ui/vue";

const showToolbar = ref(true);
const sort = ref("name");
</script>

<template>
  <Menu.Root :close-on-select="false">
    <Menu.Trigger>View <Menu.Indicator>▾</Menu.Indicator></Menu.Trigger>
    <Portal>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.CheckboxItem v-model:checked="showToolbar" value="toolbar">
            <Menu.ItemText>Show toolbar</Menu.ItemText>
            <Menu.ItemIndicator>✓</Menu.ItemIndicator>
          </Menu.CheckboxItem>
          <Menu.Separator />
          <Menu.RadioItemGroup v-model="sort">
            <Menu.ItemGroupLabel>Sort by</Menu.ItemGroupLabel>
            <Menu.RadioItem value="name">
              <Menu.ItemText>Name</Menu.ItemText>
              <Menu.ItemIndicator>✓</Menu.ItemIndicator>
            </Menu.RadioItem>
            <Menu.RadioItem value="date">
              <Menu.ItemText>Date</Menu.ItemText>
              <Menu.ItemIndicator>✓</Menu.ItemIndicator>
            </Menu.RadioItem>
          </Menu.RadioItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Portal>
  </Menu.Root>
</template>
