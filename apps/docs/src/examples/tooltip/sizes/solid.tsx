/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { Button, Portal, Tooltip } from "@moderno-ui/solid";

const sizes = ["sm", "md", "lg"] as const;

export function TooltipSizesDemo() {
  return (
    <div class="demo-row">
      <For each={sizes}>
        {(size) => (
          <Tooltip.Root size={size}>
            <Tooltip.Trigger
              asChild={(triggerProps) => (
                <Button {...triggerProps()} variant="outline">
                  {size}
                </Button>
              )}
            />
            <Portal>
              <Tooltip.Positioner>
                <Tooltip.Content>
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  A {size} tooltip
                </Tooltip.Content>
              </Tooltip.Positioner>
            </Portal>
          </Tooltip.Root>
        )}
      </For>
    </div>
  );
}
