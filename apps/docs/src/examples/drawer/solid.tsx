/** @jsxImportSource solid-js */
import { Button, Drawer, Portal } from "@moderno-ui/solid";

export function DrawerDemo() {
  return (
    <Drawer.Root>
      <Drawer.Trigger
        asChild={(triggerProps) => <Button {...triggerProps()}>Filters</Button>}
      ></Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Title>Filters</Drawer.Title>
            <Drawer.Description>Narrow the list of orders.</Drawer.Description>
            <Drawer.CloseTrigger aria-label="Close">×</Drawer.CloseTrigger>
            <div class="demo-row">
              <Drawer.CloseTrigger
                asChild={(closeProps) => (
                  <Button {...closeProps()} variant="outline">
                    Cancel
                  </Button>
                )}
              ></Drawer.CloseTrigger>
              <Drawer.CloseTrigger
                asChild={(closeProps) => <Button {...closeProps()}>Apply</Button>}
              ></Drawer.CloseTrigger>
            </div>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
