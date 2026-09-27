<script lang="ts">
  import { Button, Popover, Portal } from "@moderno-ui/svelte";
</script>

<Popover.Root>
  <Popover.Trigger>
    {#snippet asChild(triggerProps)}
      <Button {...triggerProps()}>Share</Button>
    {/snippet}
  </Popover.Trigger>
  <Portal>
    <Popover.Positioner>
      <Popover.Content>
        <Popover.Arrow>
          <Popover.ArrowTip />
        </Popover.Arrow>
        <Popover.Title>Share this page</Popover.Title>
        <Popover.Description>Anyone with the link can view it.</Popover.Description>
        <Popover.CloseTrigger aria-label="Close">×</Popover.CloseTrigger>
      </Popover.Content>
    </Popover.Positioner>
  </Portal>
</Popover.Root>
