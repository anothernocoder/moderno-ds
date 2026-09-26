/** @jsxImportSource solid-js */
import { ToggleGroup } from "@moderno-ui/solid";

export function ToggleGroupSizesDemo() {
  return (
    <div class="demo-row">
      <ToggleGroup.Root
        size="sm"
        variant="outline"
        defaultValue={["week"]}
        aria-label="Small period"
      >
        <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
        <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
      </ToggleGroup.Root>
      <ToggleGroup.Root
        size="md"
        variant="outline"
        defaultValue={["week"]}
        aria-label="Medium period"
      >
        <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
        <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
      </ToggleGroup.Root>
      <ToggleGroup.Root
        size="lg"
        variant="outline"
        defaultValue={["week"]}
        aria-label="Large period"
      >
        <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
        <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
}
