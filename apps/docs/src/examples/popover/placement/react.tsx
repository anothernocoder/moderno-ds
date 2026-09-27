import { Button, Popover, Portal } from "@moderno-ui/react";

export function PopoverPlacementDemo() {
  return (
    <Popover.Root positioning={{ placement: "right" }}>
      <Popover.Trigger asChild>
        <Button variant="outline">Billing date</Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow>
              <Popover.ArrowTip />
            </Popover.Arrow>
            <Popover.Description>You are billed on the 1st of each month.</Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
