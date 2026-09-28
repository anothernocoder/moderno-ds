<script lang="ts">
  import { Field, SegmentedControl } from "@moderno-ui/svelte";
</script>

<Field.Root>
  <Field.Label>Image scale</Field.Label>
  <SegmentedControl.Root fullWidth defaultValue="fill">
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
  <Field.HelperText>How the image fills its frame.</Field.HelperText>
</Field.Root>
