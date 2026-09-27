/** @jsxImportSource solid-js */
import { Button, Portal, Tooltip } from "@moderno-ui/solid";

export function TooltipDelayDemo() {
  return (
    <Tooltip.Root openDelay={0} closeDelay={0}>
      <Tooltip.Trigger
        asChild={(triggerProps) => (
          <Button {...triggerProps()} variant="outline">
            Copy
          </Button>
        )}
      />
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
