<script lang="ts">
  import { Toolbar } from "@moderno-ui/svelte";
</script>

{#snippet icon(d: string)}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path {d} />
  </svg>
{/snippet}

<Toolbar.Root aria-label="Canvas tools">
  <Toolbar.Button label="Undo" shortcut="⌘Z">
    {@render icon("M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11")}
  </Toolbar.Button>
  <Toolbar.Button label="Redo" shortcut="⇧⌘Z">
    {@render icon("m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13")}
  </Toolbar.Button>
  <Toolbar.Separator />
  <Toolbar.Group aria-label="Text style">
    <Toolbar.Toggle label="Bold" shortcut="⌘B" defaultPressed>
      {@render icon("M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8")}
    </Toolbar.Toggle>
    <Toolbar.Toggle label="Italic" shortcut="⌘I">
      {@render icon("M19 4h-9M14 20H5M15 4 9 20")}
    </Toolbar.Toggle>
  </Toolbar.Group>
  <Toolbar.Separator />
  <Toolbar.Button label="Zoom out">{@render icon("M5 12h14")}</Toolbar.Button>
  <span>100%</span>
  <Toolbar.Button label="Zoom in">{@render icon("M5 12h14M12 5v14")}</Toolbar.Button>
</Toolbar.Root>
