/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";
import { Button, Drawer, Portal } from "@moderno-ui/solid";

export function DrawerControlledDemo() {
  const [open, setOpen] = createSignal(false);
  return (
    <Drawer.Root open={open()} onOpenChange={(details) => setOpen(details.open)}>
      <Drawer.Trigger
        asChild={(triggerProps) => (
          <Button {...triggerProps()} variant="outline">
            Settings
          </Button>
        )}
      ></Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Title>Settings</Drawer.Title>
            <Drawer.Description>Changes apply when you save.</Drawer.Description>
            <div class="demo-row">
              <Button onClick={() => setOpen(false)}>Save</Button>
            </div>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
