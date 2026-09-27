<script lang="ts">
  import { Button, Popover, Portal } from "@moderno-ui/svelte";

  let open = $state(false);
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet asChild(triggerProps)}
      <Button variant="outline" {...triggerProps()}>Notifications</Button>
    {/snippet}
  </Popover.Trigger>
  <Portal>
    <Popover.Positioner>
      <Popover.Content>
        <Popover.Title>You are all caught up</Popover.Title>
        <Popover.Description>New notifications show up here.</Popover.Description>
        <div class="demo-row">
          <Button size="sm" onclick={() => (open = false)}>Got it</Button>
        </div>
      </Popover.Content>
    </Popover.Positioner>
  </Portal>
</Popover.Root>
