/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { Button, Portal, Tooltip } from "@moderno-ui/solid";

const placements = ["top", "right", "bottom", "left"] as const;

export function TooltipPlacementDemo() {
  return (
    <div class="demo-row">
      <For each={placements}>
        {(placement) => (
          <Tooltip.Root positioning={{ placement }}>
            <Tooltip.Trigger
              asChild={(triggerProps) => (
                <Button {...triggerProps()} variant="outline">
                  {placement}
                </Button>
              )}
            />
            <Portal>
              <Tooltip.Positioner>
                <Tooltip.Content>
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  On the {placement}
                </Tooltip.Content>
              </Tooltip.Positioner>
            </Portal>
          </Tooltip.Root>
        )}
      </For>
    </div>
  );
}
