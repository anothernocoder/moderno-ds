/** @jsxImportSource solid-js */
import { ToggleGroup } from "@moderno-ui/solid";

export function ToggleGroupDisabledDemo() {
  return (
    <ToggleGroup.Root defaultValue={["left"]} aria-label="Text alignment">
      <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
      <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
      <ToggleGroup.Item value="right" disabled>
        Right
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
