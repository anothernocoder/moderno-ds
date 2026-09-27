<script lang="ts">
  import { Button, Drawer, Portal } from "@moderno-ui/svelte";

  let open = $state(false);
</script>

<Drawer.Root bind:open>
  <Drawer.Trigger>
    {#snippet asChild(triggerProps)}
      <Button variant="outline" {...triggerProps()}>Settings</Button>
    {/snippet}
  </Drawer.Trigger>
  <Portal>
    <Drawer.Backdrop />
    <Drawer.Positioner>
      <Drawer.Content>
        <Drawer.Title>Settings</Drawer.Title>
        <Drawer.Description>Changes apply when you save.</Drawer.Description>
        <div class="demo-row">
          <Button onclick={() => (open = false)}>Save</Button>
        </div>
      </Drawer.Content>
    </Drawer.Positioner>
  </Portal>
</Drawer.Root>
