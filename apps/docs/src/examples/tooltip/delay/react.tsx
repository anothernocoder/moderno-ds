import { Button, Portal, Tooltip } from "@moderno-ui/react";

export function TooltipDelayDemo() {
  return (
    <Tooltip.Root openDelay={0} closeDelay={0}>
      <Tooltip.Trigger asChild>
        <Button variant="outline">Copy</Button>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            Shows at once
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
