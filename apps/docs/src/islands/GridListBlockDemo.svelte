<!--
  The grid-list block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/grid-list/svelte), not a
  copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file three times, one per column count (ADR-0005):
  18rem is below `--container-sm` (one column, header stacked), 40rem sits
  between `--container-md` and `--container-lg` (two columns, header on one
  row), and 50rem crosses `--container-lg` (three columns). The docs column
  never reaches 48rem, so the wide frame holds a 50rem stage and scrolls
  sideways inside itself; the page never does.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import GridList from "../../../../registry/blocks/grid-list/svelte/GridList.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const error = {
    en: "We could not load your projects.",
    es: "No pudimos cargar tus proyectos.",
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <GridList />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <GridList />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><GridList /></div>
        </div>
      </div>
    </div>
  {:else if state === "empty"}
    <GridList items={[]} />
  {:else if state === "loading"}
    <GridList loading />
  {:else if state === "error"}
    <GridList {error} />
  {:else if state === "disabled"}
    <GridList disabled />
  {:else}
    <GridList />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     panel instead of scrolling inside its own frame. */
  .demo-widths {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }
  .demo-scroll {
    overflow-x: auto;
  }
  /* The width is the demo's, not the design system's: the block sizes only
     from contract slots. */
  .demo-wide {
    width: 50rem;
  }
</style>
