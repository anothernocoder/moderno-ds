/** @jsxImportSource solid-js */
import { SegmentedControl } from "@moderno-ui/solid";

export function SegmentedControlSizesDemo() {
  return (
    <div class="demo-row">
      <SegmentedControl.Root size="sm" defaultValue="week" aria-label="Small period">
        <SegmentedControl.Indicator />
        <SegmentedControl.Item value="day">
          <SegmentedControl.ItemText>Day</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="week">
          <SegmentedControl.ItemText>Week</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="month">
          <SegmentedControl.ItemText>Month</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
      </SegmentedControl.Root>
      <SegmentedControl.Root size="md" defaultValue="week" aria-label="Medium period">
        <SegmentedControl.Indicator />
        <SegmentedControl.Item value="day">
          <SegmentedControl.ItemText>Day</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="week">
          <SegmentedControl.ItemText>Week</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="month">
          <SegmentedControl.ItemText>Month</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
      </SegmentedControl.Root>
      <SegmentedControl.Root size="lg" defaultValue="week" aria-label="Large period">
        <SegmentedControl.Indicator />
        <SegmentedControl.Item value="day">
          <SegmentedControl.ItemText>Day</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="week">
          <SegmentedControl.ItemText>Week</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="month">
          <SegmentedControl.ItemText>Month</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
      </SegmentedControl.Root>
    </div>
  );
}
