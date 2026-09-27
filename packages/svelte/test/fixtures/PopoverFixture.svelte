<script lang="ts">
  import { Popover } from "../../src/index.js";
  import type { PopoverOpenChangeDetails, PopoverSize } from "../../src/index.js";

  let {
    size = undefined,
    open = $bindable(),
    onOpenChange = undefined,
  }: {
    size?: PopoverSize;
    open?: boolean;
    onOpenChange?: (details: PopoverOpenChangeDetails) => void;
  } = $props();
</script>

<Popover.Root {size} bind:open {onOpenChange}>
  <Popover.Trigger>Share</Popover.Trigger>
  <Popover.Positioner>
    <Popover.Content class="share" data-testid="share">
      <Popover.Arrow>
        <Popover.ArrowTip />
      </Popover.Arrow>
      <Popover.Title>Share this page</Popover.Title>
      <Popover.Description>Anyone with the link can view it.</Popover.Description>
      <Popover.CloseTrigger aria-label="Close">×</Popover.CloseTrigger>
    </Popover.Content>
  </Popover.Positioner>
</Popover.Root>
