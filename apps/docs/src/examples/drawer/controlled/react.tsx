import { useState } from "react";
import { Button, Drawer, Portal } from "@moderno-ui/react";

export function DrawerControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
      <Drawer.Trigger asChild>
        <Button variant="outline">Settings</Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Title>Settings</Drawer.Title>
            <Drawer.Description>Changes apply when you save.</Drawer.Description>
            <div className="demo-row">
              <Button onClick={() => setOpen(false)}>Save</Button>
            </div>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
