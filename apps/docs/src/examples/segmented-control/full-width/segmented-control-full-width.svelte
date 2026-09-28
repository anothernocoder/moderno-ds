<script lang="ts">
  import { SegmentedControl } from "@moderno-ui/svelte";
</script>

<div class="demo-stack">
  <SegmentedControl.Root fullWidth defaultValue="yearly" aria-label="Billing">
    <SegmentedControl.Indicator />
    <SegmentedControl.Item value="monthly">
      <SegmentedControl.ItemText>Monthly</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
    <SegmentedControl.Item value="yearly">
      <SegmentedControl.ItemText>Yearly</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
  </SegmentedControl.Root>
</div>
