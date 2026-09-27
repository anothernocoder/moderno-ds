<script lang="ts">
  import { Menu, Portal } from "@moderno-ui/svelte";

  let showToolbar = $state(true);
  let sort = $state("name");
</script>

<Menu.Root closeOnSelect={false}>
  <Menu.Trigger>View <Menu.Indicator>▾</Menu.Indicator></Menu.Trigger>
  <Portal>
    <Menu.Positioner>
      <Menu.Content>
        <Menu.CheckboxItem value="toolbar" bind:checked={showToolbar}>
          <Menu.ItemText>Show toolbar</Menu.ItemText>
          <Menu.ItemIndicator>✓</Menu.ItemIndicator>
        </Menu.CheckboxItem>
        <Menu.Separator />
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
      </Menu.Content>
    </Menu.Positioner>
  </Portal>
</Menu.Root>
