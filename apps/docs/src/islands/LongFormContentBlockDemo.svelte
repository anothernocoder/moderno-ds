<!--
  The long-form content block in one state per Preview: the page's main
  preview mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/long-form-content/svelte),
  not a copy, so the demo cannot drift from the file the docs print underneath
  it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the lead at body size, the
  facts in two columns), 30rem sits between `--container-sm` and
  `--container-md` (a larger lead, the quote further in), 40rem between
  `--container-md` and `--container-lg` (a larger heading and quote, the facts
  in one row) and 50rem crosses `--container-lg` (the facts beside the story,
  more room above and below). The docs column never reaches the 48rem `@lg`
  step, so the wide frame holds a 50rem stage and scrolls sideways inside
  itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the case study again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import LongFormContent from "../../../../registry/blocks/long-form-content/svelte/LongFormContent.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: { error: "We could not load this case study." },
    es: { error: "No pudimos cargar este caso de estudio." },
  }[locale];

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <LongFormContent />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <LongFormContent />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <LongFormContent />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><LongFormContent /></div>
        </div>
      </div>
    </div>
  {:else if shown === "empty"}
    <LongFormContent sections={[]} />
  {:else if shown === "loading"}
    <LongFormContent loading />
  {:else if shown === "error"}
    <LongFormContent {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <LongFormContent disabled />
  {:else}
    <LongFormContent />
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
