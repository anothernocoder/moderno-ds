/** @jsxImportSource solid-js */
import { ToggleGroup } from "@moderno-ui/solid";

export function ToggleGroupDemo() {
  return (
    <ToggleGroup.Root defaultValue={["center"]} aria-label="Text alignment">
      <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
      <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
      <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
