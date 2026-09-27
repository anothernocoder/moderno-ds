import { Button, Portal, Tooltip } from "@moderno-ui/react";

export function TooltipDemo() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button variant="outline">Save</Button>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            Save your changes
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
