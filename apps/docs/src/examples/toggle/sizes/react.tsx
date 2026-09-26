import { Toggle } from "@moderno-ui/react";

export function ToggleSizesDemo() {
  return (
    <div className="demo-row">
      <Toggle.Root size="sm" variant="outline">
        Small
      </Toggle.Root>
      <Toggle.Root size="md" variant="outline">
        Medium
      </Toggle.Root>
      <Toggle.Root size="lg" variant="outline">
        Large
      </Toggle.Root>
    </div>
  );
}
