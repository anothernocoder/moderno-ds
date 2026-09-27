<script lang="ts">
  import { Button, Portal, Tooltip } from "@moderno-ui/svelte";
</script>

<Tooltip.Root openDelay={0} closeDelay={0}>
  <Tooltip.Trigger>
    {#snippet asChild(triggerProps)}
      <Button variant="outline" {...triggerProps()}>Copy</Button>
    {/snippet}
  </Tooltip.Trigger>
  <Portal>
    <Tooltip.Positioner>
      <Tooltip.Content>
        <Tooltip.Arrow>
          <Tooltip.ArrowTip />
        </Tooltip.Arrow>
        Shows at once
      </Tooltip.Content>
    </Tooltip.Positioner>
  </Portal>
</Tooltip.Root>
