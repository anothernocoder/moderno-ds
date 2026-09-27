<!--
  The contact block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/contact/svelte), not a
  copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (everything stacked, the
  send button full width), 30rem sits between `--container-sm` and
  `--container-md` (the reply note beside the send button), 40rem between
  `--container-md` and `--container-lg` (a larger heading, name and email side
  by side) and 50rem crosses `--container-lg` (the details beside the form,
  more room above and below). The docs column never reaches the 48rem `@lg`
  step, so the wide frame holds a 50rem stage and scrolls sideways inside
  itself; the page never does.

  The default copy answers "Send message" with its sent state, and the error
  copy holds its messages the way a consumer does: sending again clears them
  to "" and {}, and the block treats the empty string as no error. Both stop
  the browser's own submit, so the docs page never navigates.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import Contact from "../../../../registry/blocks/contact/svelte/Contact.svelte";

  type State =
    | "default"
    | "widths"
    | "empty"
    | "loading"
    | "error"
    | "disabled"
    | "sent";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: {
      error: "We could not send your message.",
      email: "Enter an email address like you@example.com.",
    },
    es: {
      error: "No pudimos enviar tu mensaje.",
      email: "Escribe un correo como tu@ejemplo.com.",
    },
  }[locale];

  let sent = $state(false);
  let error = $state(copy.error);
  let errors: Record<string, string> = $state({ email: copy.email });

  function send(event: SubmitEvent) {
    event.preventDefault();
    sent = true;
  }

  function sendAgain(event: SubmitEvent) {
    event.preventDefault();
    error = "";
    errors = {};
  }
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <Contact onsubmit={(event) => event.preventDefault()} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <Contact onsubmit={(event) => event.preventDefault()} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <Contact onsubmit={(event) => event.preventDefault()} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><Contact onsubmit={(event) => event.preventDefault()} /></div>
        </div>
      </div>
    </div>
  {:else if shown === "empty"}
    <Contact channels={[]} onsubmit={(event) => event.preventDefault()} />
  {:else if shown === "loading"}
    <Contact loading />
  {:else if shown === "error"}
    <Contact {error} {errors} onsubmit={sendAgain} />
  {:else if shown === "disabled"}
    <Contact disabled />
  {:else if shown === "sent"}
    <Contact sent />
  {:else}
    <Contact {sent} onsubmit={send} />
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
