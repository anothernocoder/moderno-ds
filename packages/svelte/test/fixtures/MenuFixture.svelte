<script lang="ts">
  import { Menu, Portal } from "../../src/index.js";
  import type { MenuSelectionDetails, MenuSize } from "../../src/index.js";

  let {
    size,
    submenuSize,
    onSelect,
  }: {
    size?: MenuSize;
    submenuSize?: MenuSize;
    onSelect?: (details: MenuSelectionDetails) => void;
  } = $props();

  let wrap = $state(false);
  let sort = $state("name");
</script>

<Menu.Root {size} {onSelect}>
  <Menu.Trigger>Actions <Menu.Indicator>▾</Menu.Indicator></Menu.Trigger>
  <Portal>
    <Menu.Positioner>
      <Menu.Content>
        <Menu.ItemGroup>
          <Menu.ItemGroupLabel>File</Menu.ItemGroupLabel>
          <Menu.Item value="new">New file</Menu.Item>
          <Menu.Item value="rename" disabled>Rename</Menu.Item>
        </Menu.ItemGroup>
        <Menu.Separator />
        <Menu.CheckboxItem value="wrap" bind:checked={wrap}>
          <Menu.ItemText>Word wrap</Menu.ItemText>
          <Menu.ItemIndicator>✓</Menu.ItemIndicator>
        </Menu.CheckboxItem>
        <Menu.RadioItemGroup bind:value={sort}>
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
        <Menu.Root size={submenuSize}>
          <Menu.TriggerItem>Share</Menu.TriggerItem>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="email">Email</Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Menu.Content>
    </Menu.Positioner>
  </Portal>
</Menu.Root>
