<script lang="ts">
  import { SegmentedControl } from "@moderno-ui/svelte";
</script>

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
