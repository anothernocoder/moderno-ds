import { SegmentedControl } from "@moderno-ui/react";

export function SegmentedControlDisabledDemo() {
  return (
    <SegmentedControl.Root defaultValue="fit" aria-label="Image scale">
      <SegmentedControl.Indicator />
      <SegmentedControl.Item value="fit">
        <SegmentedControl.ItemText>Fit</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="fill">
        <SegmentedControl.ItemText>Fill</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="stretch" disabled>
        <SegmentedControl.ItemText>Stretch</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}
