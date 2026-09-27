<!--
  The empty-state block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/empty-state/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the actions stacked, full
  width), 30rem sits between `--container-sm` and `--container-md` (the actions
  side by side), 40rem between `--container-md` and `--container-lg` (a larger
  icon and title) and 50rem crosses `--container-lg` (more room above and
  below). The docs column never reaches the 48rem `@lg` step, so the wide frame
  holds a 50rem stage and scrolls sideways inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows its title again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import EmptyState from "../../../../registry/blocks/empty-state/svelte/EmptyState.svelte";

  type State =
    | "default"
    | "widths"
    | "no-results"
    | "message-only"
    | "loading"
    | "error"
    | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: {
      error: "We could not load your projects.",
      noResultsTitle: "No results found",
      noResultsDescription: "Nothing matches “quarterly report”. Try another word or clear the filters.",
      clearFilters: "Clear filters",
      caughtUpTitle: "You’re all caught up",
      caughtUpDescription: "New notifications show up here as they arrive.",
    },
    es: {
      error: "No pudimos cargar tus proyectos.",
      noResultsTitle: "Sin resultados",
      noResultsDescription: "Nada coincide con «informe trimestral». Prueba otra palabra o quita los filtros.",
      clearFilters: "Quitar filtros",
      caughtUpTitle: "Estás al día",
      caughtUpDescription: "Las notificaciones nuevas aparecen aquí en cuanto llegan.",
    },
  }[locale];

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <EmptyState />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <EmptyState />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <EmptyState />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><EmptyState /></div>
        </div>
      </div>
    </div>
  {:else if shown === "no-results"}
    <EmptyState
      icon="search"
      title={copy.noResultsTitle}
      description={copy.noResultsDescription}
      primaryAction=""
      secondaryAction={copy.clearFilters}
    />
  {:else if shown === "message-only"}
    <EmptyState
      icon="inbox"
      title={copy.caughtUpTitle}
      description={copy.caughtUpDescription}
      primaryAction=""
      secondaryAction=""
    />
  {:else if shown === "loading"}
    <EmptyState loading />
  {:else if shown === "error"}
    <EmptyState {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <EmptyState disabled />
  {:else}
    <EmptyState />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     frame instead of scrolling inside it. */
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
