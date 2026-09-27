<!--
  SegmentedControl.ItemText — Ark's, plus the full label as a tooltip while a
  long label is cut off by an ellipsis.
-->
<script lang="ts">
  import { SegmentGroup as ArkSegmentGroup } from "@ark-ui/svelte";
  import type { SegmentGroupItemTextProps } from "@ark-ui/svelte";
  import { syncTruncationTitle } from "@moderno-ui/core";

  let { onpointerenter, ...rest }: SegmentGroupItemTextProps = $props();

  function showFullLabel(event: PointerEvent & { currentTarget: EventTarget & HTMLSpanElement }) {
    syncTruncationTitle(event.currentTarget);
    onpointerenter?.(event);
  }
</script>

<ArkSegmentGroup.ItemText {...rest} onpointerenter={showFullLabel} />
