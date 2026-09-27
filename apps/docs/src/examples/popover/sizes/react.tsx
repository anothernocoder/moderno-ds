import { Button, Popover, Portal, type PopoverSize } from "@moderno-ui/react";

const sizes: { size: PopoverSize; label: string }[] = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
];

export function PopoverSizesDemo() {
  return (
    <div className="demo-row">
      {sizes.map(({ size, label }) => (
        <Popover.Root key={size} size={size}>
          <Popover.Trigger asChild>
            <Button variant="outline">{label}</Button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content>
                <Popover.Title>{label} popover</Popover.Title>
                <Popover.Description>Padding and type follow the size.</Popover.Description>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      ))}
    </div>
  );
}
