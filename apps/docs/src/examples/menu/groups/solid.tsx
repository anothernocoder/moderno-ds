/** @jsxImportSource solid-js */
import { Menu, Portal } from "@moderno-ui/solid";

export function MenuGroupsDemo() {
  return (
    <Menu.Root>
      <Menu.Trigger>
        File <Menu.Indicator>▾</Menu.Indicator>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>Create</Menu.ItemGroupLabel>
              <Menu.Item value="new-file">New file</Menu.Item>
              <Menu.Item value="new-folder">New folder</Menu.Item>
            </Menu.ItemGroup>
            <Menu.Separator />
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>Share</Menu.ItemGroupLabel>
              <Menu.Item value="copy-link">Copy link</Menu.Item>
              <Menu.Item value="export" disabled>
                Export
              </Menu.Item>
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
