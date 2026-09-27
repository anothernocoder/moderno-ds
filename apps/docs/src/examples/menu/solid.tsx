/** @jsxImportSource solid-js */
import { Menu, Portal } from "@moderno-ui/solid";

export function MenuDemo() {
  return (
    <Menu.Root>
      <Menu.Trigger>
        Actions <Menu.Indicator>▾</Menu.Indicator>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="edit">Edit</Menu.Item>
            <Menu.Item value="duplicate">Duplicate</Menu.Item>
            <Menu.Item value="archive">Archive</Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
