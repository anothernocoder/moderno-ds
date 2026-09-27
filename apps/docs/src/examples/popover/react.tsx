import { Button, Popover, Portal } from "@moderno-ui/react";

export function PopoverDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button>Share</Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow>
              <Popover.ArrowTip />
            </Popover.Arrow>
            <Popover.Title>Share this page</Popover.Title>
            <Popover.Description>Anyone with the link can view it.</Popover.Description>
            <Popover.CloseTrigger aria-label="Close">×</Popover.CloseTrigger>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
