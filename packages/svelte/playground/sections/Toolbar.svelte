<!--
  Toolbar — the toolbar machine from @moderno-ui/core, bound with
  @zag-js/svelte: its root id and every item's value come from `$props.id()`,
  and every item is a Tab stop until the machine finds the first one after
  hydration. A pressed toggle, a disabled button, a text readout and a Menu
  trigger ride along; the tooltips render in a Portal, so not on the server.
-->
<script lang="ts">
  import { Menu } from "../../src/exports/menu.js";
  import { Toolbar } from "../../src/exports/toolbar.js";
  import type { SectionProps } from "../section.js";

  let { open }: SectionProps = $props();
</script>

<section aria-label="toolbars">
  <Toolbar.Root aria-label="Canvas tools">
    <Toolbar.Button label="Undo" shortcut="⌘Z">
      <span aria-hidden="true">↶</span>
    </Toolbar.Button>
    <Toolbar.Button label="Redo" shortcut="⇧⌘Z" disabled>
      <span aria-hidden="true">↷</span>
    </Toolbar.Button>
    <Toolbar.Separator />
    <Toolbar.Group aria-label="Text style">
      <Toolbar.Toggle label="Bold" defaultPressed>
        <span aria-hidden="true">B</span>
      </Toolbar.Toggle>
      <Toolbar.Toggle label="Italic">
        <span aria-hidden="true">I</span>
      </Toolbar.Toggle>
    </Toolbar.Group>
    <Toolbar.Separator />
    <span>100%</span>
    <Menu.Root defaultOpen={open}>
      <Menu.Trigger>
        {#snippet asChild(triggerProps)}
          <Toolbar.Button {...triggerProps()} label="More">
            <span aria-hidden="true">⋯</span>
          </Toolbar.Button>
        {/snippet}
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item value="export">Export</Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  </Toolbar.Root>
  <Toolbar.Root aria-label="Drawing tools" orientation="vertical" size="sm">
    <Toolbar.Button>Select</Toolbar.Button>
    <Toolbar.Button>Pen</Toolbar.Button>
  </Toolbar.Root>
</section>
