<!--
  The alert-list block, mounted eight times: four container widths — one in each
  band of the block's three steps — and then the empty, loading, error and
  disabled states in the page column.

  This is the registry source itself (registry/blocks/alert-list/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add alert-list-svelte`
  writes into a consumer project, so the demo cannot drift from the file the docs
  print underneath it.

  Why four widths side by side: a notification centre is exactly the block that
  gets mounted in a 320px drawer on one screen and across an activity page on the
  next, and all three of its layout changes are container-driven, not
  viewport-driven (ADR-0005). The drawer figure sits below `--container-sm`, so
  the header stacks, the dismiss controls are glyphs and each timestamp sits under
  its title; the panel figure sits between `--container-sm` and `--container-md`,
  so the header lines up but the dismiss controls stay glyphs; the page column
  crosses `--container-md` and the dismiss controls grow their label; the wide
  stage crosses `--container-lg` and every timestamp moves to the trailing edge.
  Read top to bottom, the four figures are the block's whole responsive story on
  one screen — and they disagree with each other at the same viewport, which is
  the point of a container query.

  The demo is presentational, like the block: nothing here removes an alert, so
  every figure keeps rendering the same four notifications however often you
  click. Dismissal is the consumer's own state, which is exactly what the block's
  props say.
-->
<script lang="ts">
  import AlertList from "../../../../registry/blocks/alert-list/svelte/AlertList.svelte";
</script>

<div class="demo-containers">
  <figure class="demo-container">
    <div class="demo-drawer">
      <AlertList />
    </div>
    <figcaption>
      Narrow container — a notification drawer under <code>--container-sm</code>: the header stacks,
      each dismiss control is a glyph and each timestamp sits under its title
    </figcaption>
  </figure>

  <figure class="demo-container">
    <div class="demo-panel">
      <AlertList />
    </div>
    <figcaption>
      Panel — past <code>--container-sm</code>, under <code>--container-md</code>: the heading and
      “Dismiss all” share a row, the dismiss controls are still glyphs
    </figcaption>
  </figure>

  <figure class="demo-container">
    <AlertList />
    <figcaption>
      Page column — past <code>--container-md</code> each dismiss control grows its label
    </figcaption>
  </figure>

  <figure class="demo-container">
    <div class="demo-wide">
      <div class="demo-wide-inner"><AlertList /></div>
    </div>
    <figcaption>
      Wide container — past <code>--container-lg</code> each timestamp leaves the stack under its
      title and lines up on the trailing edge, on the title's baseline. The docs prose column is
      narrower than that step, so this figure holds a wider stage and scrolls sideways inside itself
      rather than pretending the layout does not exist — <strong>scroll it to the right</strong> to
      see the timestamps in their column.
    </figcaption>
  </figure>

  <figure class="demo-container">
    <AlertList alerts={[]} />
    <figcaption>
      Empty — the list loaded and there is nothing in it, which is a render of its own rather than a
      blank space
    </figcaption>
  </figure>

  <figure class="demo-container">
    <AlertList loading />
    <figcaption>
      Loading — a busy region stands in for the list, so nobody acts on rows that are about to
      change
    </figcaption>
  </figure>

  <figure class="demo-container">
    <AlertList error="We could not load your notifications." />
    <figcaption>Error — the list itself failed, so one alert states it and offers a retry</figcaption>
  </figure>

  <figure class="demo-container">
    <AlertList disabled />
    <figcaption>
      Disabled — the alerts stay readable and every control is inert (an audit or read-only view)
    </figcaption>
  </figure>
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track is sized from its
     items' max-content, and the mock containers below carry definite widths
     wider than the docs column on a phone — which would push the whole preview
     panel sideways instead of letting each figure fit. Capping the track keeps
     the horizontal scrolling inside the one figure that asks for it. */
  .demo-containers {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--spacing-8);
  }
  .demo-container {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--spacing-3);
    margin: 0;
  }
  /* Mock containers, one in each band of the block's steps, so the stacked
     header is on screen next to the lined-up one and the glyph-only dismiss
     next to the labelled one. The widths are the demo's, not the design
     system's — the block itself sizes only from contract slots. */
  .demo-drawer {
    width: 18rem;
    max-width: 100%;
  }
  .demo-panel {
    width: 30rem;
    max-width: 100%;
  }
  /* The `@lg` step is 48rem and the docs prose column never reaches it, so this
     figure carries its own stage past the step and scrolls inside itself. The
     scroll is the demo's, not the block's: the page body never scrolls
     sideways, and the block is measuring this stage exactly as it would measure
     a real 50rem activity column. */
  .demo-wide {
    overflow-x: auto;
  }
  .demo-wide-inner {
    width: 50rem;
  }
  figcaption {
    color: var(--muted-foreground);
    font-size: 0.875em;
  }
</style>
