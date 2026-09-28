<script lang="ts">
  import { Field, SegmentedControl } from "../../src/index.js";

  let { disabled = false, invalid = false }: { disabled?: boolean; invalid?: boolean } = $props();
</script>

<Field.Root {disabled} {invalid}>
  <Field.Label>Scale</Field.Label>
  <SegmentedControl.Root defaultValue="fit">
    <SegmentedControl.Indicator />
    <SegmentedControl.Item value="fit">
      <SegmentedControl.ItemText>Fit</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
    <SegmentedControl.Item value="fill">
      <SegmentedControl.ItemText>Fill</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
  </SegmentedControl.Root>
  <Field.HelperText>How the image fills its frame.</Field.HelperText>
</Field.Root>
