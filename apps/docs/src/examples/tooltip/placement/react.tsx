import { Button, Portal, Tooltip } from "@moderno-ui/react";

const placements = ["top", "right", "bottom", "left"] as const;

export function TooltipPlacementDemo() {
  return (
    <div className="demo-row">
      {placements.map((placement) => (
        <Tooltip.Root key={placement} positioning={{ placement }}>
          <Tooltip.Trigger asChild>
            <Button variant="outline">{placement}</Button>
          </Tooltip.Trigger>
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
      ))}
    </div>
  );
}
