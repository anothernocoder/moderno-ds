<!--
  SegmentedControl.Root with the Moderno recipe folded in: `size` and
  `fullWidth` land on the root part as data-size / data-full-width, and the
  segments sit in a row. Inside a Field, the Field's label names the group and
  its helper or error text describes it (`segmentedControlFieldProps`).
  `children` and every other prop pass straight through via `...rest`;
  `value` stays bindable.
-->
<script lang="ts">
  import { SegmentGroup as ArkSegmentGroup, useFieldContext } from "@ark-ui/svelte";
  import type { SegmentGroupRootProps } from "@ark-ui/svelte";
  import {
    segmentedControlAttrs,
    segmentedControlFieldProps,
    type SegmentedControlAttrsProps,
  } from "@moderno-ui/core";

  let {
    size,
    fullWidth,
    value = $bindable(),
    ...rest
  }: SegmentGroupRootProps & SegmentedControlAttrsProps = $props();

  const field = useFieldContext();
</script>

<ArkSegmentGroup.Root
  orientation="horizontal"
  bind:value
  {...rest}
  {...segmentedControlFieldProps(field?.(), rest)}
  {...segmentedControlAttrs({ size, fullWidth })}
/>
