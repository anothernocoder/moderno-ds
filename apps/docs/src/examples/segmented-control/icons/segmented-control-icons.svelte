<script lang="ts">
  import { SegmentedControl } from "@moderno-ui/svelte";
</script>

<SegmentedControl.Root defaultValue="grid" aria-label="View">
  <SegmentedControl.Indicator />
  <SegmentedControl.Item value="list">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
    <SegmentedControl.ItemText>List</SegmentedControl.ItemText>
    <SegmentedControl.ItemHiddenInput />
  </SegmentedControl.Item>
  <SegmentedControl.Item value="grid">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
    <SegmentedControl.ItemText>Grid</SegmentedControl.ItemText>
    <SegmentedControl.ItemHiddenInput />
  </SegmentedControl.Item>
</SegmentedControl.Root>
