/** @jsxImportSource solid-js */
import { Toggle } from "@moderno-ui/solid";

export function ToggleSizesDemo() {
  return (
    <div class="demo-row">
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
