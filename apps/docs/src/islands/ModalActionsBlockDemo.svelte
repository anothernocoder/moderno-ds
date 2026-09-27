<!--
  The modal-actions block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/modal-actions/svelte),
  not a copy, so the demo cannot drift from the file the docs print underneath
  it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (each button under its
  text), 30rem sits between `--container-sm` and `--container-md` (buttons
  beside their text), 40rem between `--container-md` and `--container-lg` (a
  larger heading) and 50rem crosses `--container-lg` (the heading beside the
  list). The docs column never reaches the 48rem `@lg` step, so the wide frame
  holds a 50rem stage and scrolls sideways inside itself; the page never does.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import ModalActions from "../../../../registry/blocks/modal-actions/svelte/ModalActions.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const copy = {
    en: { error: "We could not load your account actions." },
    es: { error: "No pudimos cargar las acciones de tu cuenta." },
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <ModalActions />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <ModalActions />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <ModalActions />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><ModalActions /></div>
        </div>
      </div>
    </div>
  {:else if state === "empty"}
    <ModalActions actions={[]} />
  {:else if state === "loading"}
    <ModalActions loading />
  {:else if state === "error"}
    <ModalActions error={copy.error} />
  {:else if state === "disabled"}
    <ModalActions disabled />
  {:else}
    <ModalActions />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     list instead of scrolling inside its own frame. */
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
