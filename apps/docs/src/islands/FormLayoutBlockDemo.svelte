<!--
  The form-layout block, mounted seven times: four container widths — one in
  each band of the block's three steps — and then the error, loading and
  disabled states in the page column.

  This is the registry source itself (registry/blocks/form-layout/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add form-layout-svelte`
  writes into a consumer project, so the demo cannot drift from the file the docs
  print underneath it.

  Why four widths side by side: a form-layout is the block whose shape changes
  most with the room it is given, and all three changes are container-driven, not
  viewport-driven (ADR-0005). The sidebar figure sits below `--container-sm`, so
  the actions row stacks and the fields run one-up; the panel figure sits between
  `--container-sm` and `--container-md`, so the actions row lines up but the
  fields still run one-up; the page column crosses `--container-md` and the
  fields pair off; the wide stage crosses `--container-lg` and each group's
  heading moves beside its fields. Read top to bottom, the four figures are the
  block's whole responsive story on one screen — and they disagree with each
  other at the same viewport, which is the point of a container query.
-->
<script lang="ts">
  import FormLayout from "../../../../registry/blocks/form-layout/svelte/FormLayout.svelte";
</script>

<div class="demo-containers">
  <figure class="demo-container">
    <div class="demo-sidebar">
      <FormLayout />
    </div>
    <figcaption>
      Narrow container — a settings sidebar under <code>--container-sm</code>: the actions row
      stacks and the fields run one-up
    </figcaption>
  </figure>

  <figure class="demo-container">
    <div class="demo-panel">
      <FormLayout />
    </div>
    <figcaption>
      Panel — past <code>--container-sm</code>, under <code>--container-md</code>: the actions row
      lines up to the trailing edge, the fields still run one-up
    </figcaption>
  </figure>

  <figure class="demo-container">
    <FormLayout />
    <figcaption>
      Page column — past <code>--container-md</code> the fields pair off, two to a row
    </figcaption>
  </figure>

  <figure class="demo-container">
    <div class="demo-wide">
      <div class="demo-wide-inner"><FormLayout /></div>
    </div>
    <figcaption>
      Wide container — past <code>--container-lg</code> each group's heading leaves the top of its
      fields and sits beside them. The docs prose column is narrower than that step, so this figure
      holds a wider stage and scrolls sideways inside itself rather than pretending the layout does
      not exist.
    </figcaption>
  </figure>

  <figure class="demo-container">
    <FormLayout
      error="We could not save your changes. Fix the two fields below and try again."
      errors={{
        email: "Enter a valid email address.",
        about: "Keep this under 280 characters.",
      }}
    />
    <figcaption>
      Error — one form-level alert for the save, plus a message on each field that caused it
    </figcaption>
  </figure>

  <figure class="demo-container">
    <FormLayout loading />
    <figcaption>Loading — every control inert, the submit marked <code>aria-busy</code></figcaption>
  </figure>

  <figure class="demo-container">
    <FormLayout disabled />
    <figcaption>
      Disabled — the form is read-only (a viewer-role member, a locked account)
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
     actions row is on screen next to the lined-up one and the one-up field
     column next to the paired grid. The widths are the demo's, not the design
     system's — the block itself sizes only from contract slots. */
  .demo-sidebar {
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
     sideways, and the block is measuring this stage exactly as it would
     measure a real 50rem settings column. */
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
