<!--
  SegmentedControl — one native radio per segment, each named by its text;
  the checked segment, the sizes, fullWidth, a disabled segment and a
  disabled control reach the server string. The indicator has no box on the
  server, so it stays hidden until the client measures the checked segment.
-->
<script lang="ts">
  import { SegmentedControl } from "../../src/exports/segmented-control.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="segmented controls">
  <SegmentedControl.Root defaultValue="fill" aria-label="Scale">
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
  <SegmentedControl.Root size="sm" fullWidth disabled value="week" aria-label="Period">
    <SegmentedControl.Indicator />
    <SegmentedControl.Item value="day">
      <SegmentedControl.ItemText>Day</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
    <SegmentedControl.Item value="week">
      <SegmentedControl.ItemText>Week</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
  </SegmentedControl.Root>
</section>
