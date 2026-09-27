/** @jsxImportSource solid-js */
import { Button, Portal, Tooltip } from "@moderno-ui/solid";

export function TooltipDemo() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        asChild={(triggerProps) => (
          <Button {...triggerProps()} variant="outline">
            Save
          </Button>
        )}
      />
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
