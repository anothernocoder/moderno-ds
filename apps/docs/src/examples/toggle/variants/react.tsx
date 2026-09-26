import { Toggle } from "@moderno-ui/react";

export function ToggleVariantsDemo() {
  return (
    <div className="demo-row">
      <Toggle.Root>Ghost</Toggle.Root>
      <Toggle.Root variant="outline">Outline</Toggle.Root>
    </div>
  );
}
