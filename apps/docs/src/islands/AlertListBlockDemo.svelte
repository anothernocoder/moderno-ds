<!--
  The alert-list block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/alert-list/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add alert-list-svelte`
  writes into a consumer project, so the demo cannot drift from the file the docs
  print underneath it.

  `widths` frames the same file three times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (header stacks, dismiss
  glyphs, timestamps under titles), 30rem sits between `--container-sm` and
  `--container-md` (header on one row, dismiss still glyphs), and 50rem crosses
  `--container-lg` (timestamps on the trailing edge). The page column itself,
  the `default` state, crosses `--container-md` on a desktop, so the dismiss
  controls grow their label there.

  The `@lg` step is 48rem and the docs column never reaches it, so the wide frame
  holds a 50rem stage and scrolls sideways inside itself; the page never does.

  The demo is presentational, like the block: nothing here removes an alert.
  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import AlertList from "../../../../registry/blocks/alert-list/svelte/AlertList.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const error = {
    en: "We could not load your notifications.",
    es: "No pudimos cargar tus notificaciones.",
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <AlertList />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <AlertList />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><AlertList /></div>
        </div>
      </div>
    </div>
  {:else if state === "empty"}
    <AlertList alerts={[]} />
  {:else if state === "loading"}
    <AlertList loading />
  {:else if state === "error"}
    <AlertList {error} />
  {:else if state === "disabled"}
    <AlertList disabled />
  {:else}
    <AlertList />
  {/if}
</div>

<style>
  /* The three frames stack, with room for each frame's label on its border.
     `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage below would widen the track past
     the panel, pushing the whole preview sideways instead of scrolling inside
     its own frame. */
  .demo-widths {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }
  /* The frame never outgrows the stage, so the 50rem the `@lg` step needs is
     carried by this inner stage and scrolled inside the frame. The width is the
     demo's, not the design system's — the block sizes only from contract slots. */
  .demo-scroll {
    overflow-x: auto;
  }
  .demo-wide {
    width: 50rem;
  }
</style>
