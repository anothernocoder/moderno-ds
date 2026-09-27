import { Button, Drawer, Portal } from "@moderno-ui/react";

export function DrawerDemo() {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <Button>Filters</Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Title>Filters</Drawer.Title>
            <Drawer.Description>Narrow the list of orders.</Drawer.Description>
            <Drawer.CloseTrigger aria-label="Close">×</Drawer.CloseTrigger>
            <div className="demo-row">
              <Drawer.CloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Drawer.CloseTrigger>
              <Drawer.CloseTrigger asChild>
                <Button>Apply</Button>
              </Drawer.CloseTrigger>
            </div>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
