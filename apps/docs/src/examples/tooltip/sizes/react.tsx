import { Button, Portal, Tooltip } from "@moderno-ui/react";

const sizes = ["sm", "md", "lg"] as const;

export function TooltipSizesDemo() {
  return (
    <div className="demo-row">
      {sizes.map((size) => (
        <Tooltip.Root key={size} size={size}>
          <Tooltip.Trigger asChild>
            <Button variant="outline">{size}</Button>
          </Tooltip.Trigger>
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
      ))}
    </div>
  );
}
