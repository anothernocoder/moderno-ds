import { useState } from "react";
import { Button, Popover, Portal } from "@moderno-ui/react";

export function PopoverControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
      <Popover.Trigger asChild>
        <Button variant="outline">Notifications</Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Title>You are all caught up</Popover.Title>
            <Popover.Description>New notifications show up here.</Popover.Description>
            <div className="demo-row">
              <Button size="sm" onClick={() => setOpen(false)}>
                Got it
              </Button>
            </div>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
