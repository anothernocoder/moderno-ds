<!--
  The newsletter block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/newsletter/svelte), not a
  copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the field and the button
  stacked, the button full width), 30rem sits between `--container-sm` and
  `--container-md` (the field and the button in one row), 40rem between
  `--container-md` and `--container-lg` (a larger heading) and 50rem crosses
  `--container-lg` (the text and the form in two columns). The docs column
  never reaches the 48rem `@lg` step, so the wide frame holds a 50rem stage and
  scrolls sideways inside itself; the page never does.

  The default copy answers "Subscribe" with its subscribed state, and the
  error copy holds its message the way a consumer does: subscribing again
  clears it to "", and the block treats the empty string as no error. Both stop
  the browser's own submit, so the docs page never navigates.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import Newsletter from "../../../../registry/blocks/newsletter/svelte/Newsletter.svelte";

  type State =
    | "default"
    | "widths"
    | "empty"
    | "loading"
    | "error"
    | "disabled"
    | "subscribed";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: { error: "Enter an email address like you@example.com." },
    es: { error: "Escribe un correo como tu@ejemplo.com." },
  }[locale];

  let subscribed = $state(false);
  let error = $state(copy.error);

  function subscribe(event: SubmitEvent) {
    event.preventDefault();
    subscribed = true;
  }

  function subscribeAgain(event: SubmitEvent) {
    event.preventDefault();
    error = "";
  }
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <Newsletter onsubmit={(event) => event.preventDefault()} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <Newsletter onsubmit={(event) => event.preventDefault()} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <Newsletter onsubmit={(event) => event.preventDefault()} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><Newsletter onsubmit={(event) => event.preventDefault()} /></div>
        </div>
      </div>
    </div>
  {:else if shown === "empty"}
    <Newsletter description="" note="" onsubmit={(event) => event.preventDefault()} />
  {:else if shown === "loading"}
    <Newsletter loading />
  {:else if shown === "error"}
    <Newsletter {error} onsubmit={subscribeAgain} />
  {:else if shown === "disabled"}
    <Newsletter disabled />
  {:else if shown === "subscribed"}
    <Newsletter subscribed />
  {:else}
    <Newsletter {subscribed} onsubmit={subscribe} />
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
