/** @jsxImportSource solid-js */
import { Menu, Portal } from "@moderno-ui/solid";

export function MenuContextMenuDemo() {
  return (
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
  );
}
