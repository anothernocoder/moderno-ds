/** @jsxImportSource solid-js */
import { Toggle } from "@moderno-ui/solid";

export function ToggleVariantsDemo() {
  return (
    <div class="demo-row">
      <Toggle.Root>Ghost</Toggle.Root>
      <Toggle.Root variant="outline">Outline</Toggle.Root>
    </div>
  );
}
