<script lang="ts">
  import { Button, Popover, Portal, type PopoverSize } from "@moderno-ui/svelte";

  const sizes: { size: PopoverSize; label: string }[] = [
    { size: "sm", label: "Small" },
    { size: "md", label: "Medium" },
    { size: "lg", label: "Large" },
  ];
</script>

<div class="demo-row">
  {#each sizes as { size, label } (size)}
    <Popover.Root {size}>
      <Popover.Trigger>
        {#snippet asChild(triggerProps)}
          <Button variant="outline" {...triggerProps()}>{label}</Button>
        {/snippet}
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Title>{label} popover</Popover.Title>
            <Popover.Description>Padding and type follow the size.</Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  {/each}
</div>
