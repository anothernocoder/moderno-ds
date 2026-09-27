/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { Button, Popover, Portal, type PopoverSize } from "@moderno-ui/solid";

const sizes: { size: PopoverSize; label: string }[] = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
];

export function PopoverSizesDemo() {
  return (
    <div class="demo-row">
      <For each={sizes}>
        {({ size, label }) => (
          <Popover.Root size={size}>
            <Popover.Trigger
              asChild={(triggerProps) => (
                <Button {...triggerProps()} variant="outline">
                  {label}
                </Button>
              )}
            ></Popover.Trigger>
            <Portal>
              <Popover.Positioner>
                <Popover.Content>
                  <Popover.Title>{label} popover</Popover.Title>
                  <Popover.Description>Padding and type follow the size.</Popover.Description>
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>
        )}
      </For>
    </div>
  );
}
