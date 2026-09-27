<script lang="ts">
  import { Button, Portal, Tooltip } from "@moderno-ui/svelte";

  const placements = ["top", "right", "bottom", "left"] as const;
</script>

<div class="demo-row">
  {#each placements as placement (placement)}
    <Tooltip.Root positioning={{ placement }}>
      <Tooltip.Trigger>
        {#snippet asChild(triggerProps)}
          <Button variant="outline" {...triggerProps()}>{placement}</Button>
        {/snippet}
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            On the {placement}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  {/each}
</div>
