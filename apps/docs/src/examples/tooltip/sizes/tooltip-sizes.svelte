<script lang="ts">
  import { Button, Portal, Tooltip } from "@moderno-ui/svelte";

  const sizes = ["sm", "md", "lg"] as const;
</script>

<div class="demo-row">
  {#each sizes as size (size)}
    <Tooltip.Root {size}>
      <Tooltip.Trigger>
        {#snippet asChild(triggerProps)}
          <Button variant="outline" {...triggerProps()}>{size}</Button>
        {/snippet}
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            A {size} tooltip
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  {/each}
</div>
