<script lang="ts">
  import { Button, Portal, Tooltip } from "@moderno-ui/svelte";
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet asChild(triggerProps)}
      <Button variant="outline" {...triggerProps()}>Save</Button>
    {/snippet}
  </Tooltip.Trigger>
  <Portal>
    <Tooltip.Positioner>
      <Tooltip.Content>
        <Tooltip.Arrow>
          <Tooltip.ArrowTip />
        </Tooltip.Arrow>
        Save your changes
      </Tooltip.Content>
    </Tooltip.Positioner>
  </Portal>
</Tooltip.Root>
