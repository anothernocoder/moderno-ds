/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";
import { Button, Popover, Portal } from "@moderno-ui/solid";

export function PopoverControlledDemo() {
  const [open, setOpen] = createSignal(false);
  return (
    <Popover.Root open={open()} onOpenChange={(details) => setOpen(details.open)}>
      <Popover.Trigger
        asChild={(triggerProps) => (
          <Button {...triggerProps()} variant="outline">
            Notifications
          </Button>
        )}
      ></Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Title>You are all caught up</Popover.Title>
            <Popover.Description>New notifications show up here.</Popover.Description>
            <div class="demo-row">
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
