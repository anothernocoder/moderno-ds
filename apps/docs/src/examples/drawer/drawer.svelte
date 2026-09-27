<script lang="ts">
  import { Button, Drawer, Portal } from "@moderno-ui/svelte";
</script>

<Drawer.Root>
  <Drawer.Trigger>
    {#snippet asChild(triggerProps)}
      <Button {...triggerProps()}>Filters</Button>
    {/snippet}
  </Drawer.Trigger>
  <Portal>
    <Drawer.Backdrop />
    <Drawer.Positioner>
      <Drawer.Content>
        <Drawer.Title>Filters</Drawer.Title>
        <Drawer.Description>Narrow the list of orders.</Drawer.Description>
        <Drawer.CloseTrigger aria-label="Close">×</Drawer.CloseTrigger>
        <div class="demo-row">
          <Drawer.CloseTrigger>
            {#snippet asChild(closeProps)}
              <Button variant="outline" {...closeProps()}>Cancel</Button>
            {/snippet}
          </Drawer.CloseTrigger>
          <Drawer.CloseTrigger>
            {#snippet asChild(closeProps)}
              <Button {...closeProps()}>Apply</Button>
            {/snippet}
          </Drawer.CloseTrigger>
        </div>
      </Drawer.Content>
    </Drawer.Positioner>
  </Portal>
</Drawer.Root>
