<script lang="ts">
  import { Toolbar } from "@moderno-ui/svelte";

  let zoom = $state(100);
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

<Toolbar.Root aria-label="Zoom">
  <Toolbar.Button label="Zoom out" onclick={() => (zoom = Math.max(25, zoom - 25))}>
    {@render icon("M5 12h14")}
  </Toolbar.Button>
  <span aria-live="polite">{zoom}%</span>
  <Toolbar.Button label="Zoom in" onclick={() => (zoom = Math.min(400, zoom + 25))}>
    {@render icon("M5 12h14M12 5v14")}
  </Toolbar.Button>
</Toolbar.Root>
