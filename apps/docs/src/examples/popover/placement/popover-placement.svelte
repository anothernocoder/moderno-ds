<script lang="ts">
  import { Button, Popover, Portal } from "@moderno-ui/svelte";
</script>

<Popover.Root positioning={{ placement: "right" }}>
  <Popover.Trigger>
    {#snippet asChild(triggerProps)}
      <Button variant="outline" {...triggerProps()}>Billing date</Button>
    {/snippet}
  </Popover.Trigger>
  <Portal>
    <Popover.Positioner>
      <Popover.Content>
        <Popover.Arrow>
          <Popover.ArrowTip />
        </Popover.Arrow>
        <Popover.Description>You are billed on the 1st of each month.</Popover.Description>
      </Popover.Content>
    </Popover.Positioner>
  </Portal>
</Popover.Root>
