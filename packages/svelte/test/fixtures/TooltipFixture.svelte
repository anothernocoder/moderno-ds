<script lang="ts">
  import { Tooltip } from "../../src/index.js";
  import type { TooltipOpenChangeDetails, TooltipSize } from "../../src/index.js";

  let {
    size = undefined,
    open = undefined,
    disabled = undefined,
    onOpenChange = undefined,
    contentRef = $bindable(null),
  }: {
    size?: TooltipSize;
    open?: boolean;
    disabled?: boolean;
    onOpenChange?: (details: TooltipOpenChangeDetails) => void;
    contentRef?: HTMLElement | null;
  } = $props();
</script>

<Tooltip.Root {size} {open} {disabled} {onOpenChange} openDelay={0} closeDelay={0}>
  <Tooltip.Trigger>Save</Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content class="hint" bind:ref={contentRef}>
      <Tooltip.Arrow>
        <Tooltip.ArrowTip />
      </Tooltip.Arrow>
      Save your changes
    </Tooltip.Content>
  </Tooltip.Positioner>
</Tooltip.Root>
