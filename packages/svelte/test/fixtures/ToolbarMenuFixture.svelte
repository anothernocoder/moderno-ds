<script lang="ts">
  import { Menu, Toolbar } from "../../src/index.js";

  let {
    disabled = false,
    onSelect,
  }: { disabled?: boolean; onSelect?: (details: { value: string }) => void } = $props();
</script>

<Toolbar.Root aria-label="Canvas tools">
  <Toolbar.Button label="Undo">U</Toolbar.Button>
  <Menu.Root onSelect={(details) => onSelect?.(details)}>
    <Menu.Trigger>
      {#snippet asChild(triggerProps)}
        <Toolbar.Button {...triggerProps()} label="More" {disabled}>⋯</Toolbar.Button>
      {/snippet}
    </Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content>
        <Menu.Item value="export">Export</Menu.Item>
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
</Toolbar.Root>
