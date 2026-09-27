<!--
  The app-banner block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/app-banner/svelte), not a
  copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (actions under the
  message), 30rem sits between `--container-sm` and `--container-md` (actions
  beside it), 40rem between `--container-md` and `--container-lg` (title and
  description on one line) and 50rem crosses `--container-lg` (each dismiss
  control shows its label). A frame never outgrows the docs column, so on a
  narrow screen the smaller frames shrink below their label. The column never
  reaches the 48rem `@lg` step, so the wide frame holds a 50rem stage and
  scrolls sideways inside itself; the page never does.

  The empty block renders nothing, so its copy carries a line saying so under
  it. `data-demo-state` names each copy's state on its wrapper, so the e2e spec
  can find each copy by what it is meant to show.
-->
<script lang="ts">
  import AppBanner from "../../../../registry/blocks/app-banner/svelte/AppBanner.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const copy = {
    en: {
      error: "We could not load your announcements.",
      empty: "Nothing to announce: the block renders nothing.",
    },
    es: {
      error: "No pudimos cargar tus avisos.",
      empty: "Nada que anunciar: el bloque no muestra nada.",
    },
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <AppBanner />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <AppBanner />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <AppBanner />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><AppBanner /></div>
        </div>
      </div>
    </div>
  {:else if state === "empty"}
    <AppBanner banners={[]} />
    <p class="demo-note">{copy.empty}</p>
  {:else if state === "loading"}
    <AppBanner loading />
  {:else if state === "error"}
    <AppBanner error={copy.error} />
  {:else if state === "disabled"}
    <AppBanner disabled />
  {:else}
    <AppBanner />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     banners instead of scrolling inside its own frame. */
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
  .demo-note {
    margin: 0;
    text-align: center;
    font-size: var(--text-ui-md);
    color: var(--muted-foreground);
  }
</style>
