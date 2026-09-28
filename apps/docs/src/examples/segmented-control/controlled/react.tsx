import { useState } from "react";
import { SegmentedControl } from "@moderno-ui/react";

export function SegmentedControlControlledDemo() {
  const [scale, setScale] = useState<string | null>("fill");
  return (
    <>
      <SegmentedControl.Root
        value={scale}
        onValueChange={(details) => setScale(details.value)}
        aria-label="Image scale"
      >
        <SegmentedControl.Indicator />
        <SegmentedControl.Item value="fit">
          <SegmentedControl.ItemText>Fit</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="fill">
          <SegmentedControl.ItemText>Fill</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="stretch">
          <SegmentedControl.ItemText>Stretch</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
      </SegmentedControl.Root>
      <p>Scale: {scale}</p>
    </>
  );
}
