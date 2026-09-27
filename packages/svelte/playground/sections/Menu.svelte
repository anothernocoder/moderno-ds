<!--
  Menu — Ark's menu machine: the trigger's aria-controls and the content's
  aria-labelledby must serialise and agree. The content is rendered in place,
  not in a Portal, so the server string carries the whole anatomy — group,
  separator, checkbox item and a submenu — hidden while closed. `open` mounts
  it open.
-->
<script lang="ts">
  import { Menu } from "../../src/exports/menu.js";
  import type { SectionProps } from "../section.js";

  let { open }: SectionProps = $props();
</script>

<section aria-label="menu">
  <Menu.Root size="sm" defaultOpen={open}>
    <Menu.Trigger>Actions <Menu.Indicator>▾</Menu.Indicator></Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content>
        <Menu.ItemGroup>
          <Menu.ItemGroupLabel>File</Menu.ItemGroupLabel>
          <Menu.Item value="new">New file</Menu.Item>
          <Menu.Item value="rename" disabled>Rename</Menu.Item>
        </Menu.ItemGroup>
        <Menu.Separator />
        <Menu.CheckboxItem value="wrap" checked>
          <Menu.ItemText>Word wrap</Menu.ItemText>
          <Menu.ItemIndicator>✓</Menu.ItemIndicator>
        </Menu.CheckboxItem>
        <Menu.Root>
          <Menu.TriggerItem>Share</Menu.TriggerItem>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="email">Email</Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
</section>
