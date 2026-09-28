<!-- A toolbar with two menu buttons and a plain item between them. -->
<script lang="ts">
  import { Menu, Toolbar, type ToolbarOrientation } from "../../src/index.js";

  let { orientation }: { orientation?: ToolbarOrientation } = $props();
</script>

{#snippet menu(label: string)}
  <Menu.Root>
    <Menu.Trigger>
      {#snippet asChild(triggerProps)}
        <Toolbar.Button {...triggerProps()} {label}>⋯</Toolbar.Button>
      {/snippet}
    </Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content>
        <Menu.Item value="one">One</Menu.Item>
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
{/snippet}

<Toolbar.Root aria-label="Canvas tools" {orientation}>
  <Toolbar.Button>First</Toolbar.Button>
  {@render menu("Shapes")}
  <Toolbar.Button>Middle</Toolbar.Button>
  {@render menu("Export")}
  <Toolbar.Button>Last</Toolbar.Button>
</Toolbar.Root>
