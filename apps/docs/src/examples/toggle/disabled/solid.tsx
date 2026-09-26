/** @jsxImportSource solid-js */
import { Toggle } from "@moderno-ui/solid";

export function ToggleDisabledDemo() {
  return (
    <div class="demo-row">
      <Toggle.Root disabled>Off</Toggle.Root>
      <Toggle.Root disabled defaultPressed>
        On
      </Toggle.Root>
    </div>
  );
}
