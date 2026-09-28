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

<div class="demo-row">
  {#each ["sm", "md", "lg"] as const as size (size)}
    <Toolbar.Root aria-label="History, {size}" {size}>
      <Toolbar.Button label="Undo">
        {@render icon("M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11")}
      </Toolbar.Button>
      <Toolbar.Button label="Redo">
        {@render icon("m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13")}
      </Toolbar.Button>
    </Toolbar.Root>
  {/each}
</div>
