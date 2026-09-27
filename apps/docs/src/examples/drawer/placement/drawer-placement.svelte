<script lang="ts">
  import { Button, Drawer, Portal } from "@moderno-ui/svelte";

  const placements = [
    { placement: "left", label: "Left" },
    { placement: "right", label: "Right" },
    { placement: "top", label: "Top" },
    { placement: "bottom", label: "Bottom" },
  ] as const;
</script>

<div class="demo-row">
  {#each placements as { placement, label } (placement)}
    <Drawer.Root {placement}>
      <Drawer.Trigger>
        {#snippet asChild(triggerProps)}
          <Button variant="outline" {...triggerProps()}>{label}</Button>
        {/snippet}
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Title>{label} drawer</Drawer.Title>
            <Drawer.Description>It slides in from the {placement} edge.</Drawer.Description>
            <Drawer.CloseTrigger aria-label="Close">×</Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  {/each}
</div>
