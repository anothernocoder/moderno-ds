import { Menu, Portal, Toolbar } from "@moderno-ui/react";

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export function ToolbarMenuDemo() {
  return (
    <Toolbar.Root aria-label="Layer tools">
      <Toolbar.Button label="Duplicate" shortcut="⌘D">
        <Icon d="M8 8h12v12H8zM4 16V4h12" />
      </Toolbar.Button>
      <Menu.Root>
        <Menu.Trigger asChild>
          <Toolbar.Button label="More">
            <Icon d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0M18 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0" />
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
  );
}
