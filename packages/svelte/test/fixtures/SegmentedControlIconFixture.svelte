<script lang="ts">
  import { SegmentedControl } from "../../src/index.js";
</script>

<SegmentedControl.Root aria-label="Alignment" defaultValue="left">
  <SegmentedControl.Item value="left">
    <svg aria-hidden="true"></svg>
    <SegmentedControl.ItemText hidden>Align left</SegmentedControl.ItemText>
    <SegmentedControl.ItemHiddenInput />
  </SegmentedControl.Item>
</SegmentedControl.Root>
