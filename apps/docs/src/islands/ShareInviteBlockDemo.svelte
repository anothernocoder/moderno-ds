<!--
  The share-invite block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/share-invite/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (everything stacked, two
  channels a row), 30rem sits between `--container-sm` and `--container-md`
  (each field beside its button, four channels a row), 40rem between
  `--container-md` and `--container-lg` (the people in two columns) and 50rem
  crosses `--container-lg` (the invite and the link as two panes). The docs
  column never reaches the 48rem `@lg` step, so the wide frame holds a 50rem
  stage and scrolls sideways inside itself; the page never does.

  The invite waits a moment, like a request would, so the button's sending
  state shows; `invite-fails` rejects it, and the block reports that in an
  error toast. The error copy holds its message the way a consumer does, as a
  string, and "Try again" clears it to "": the block treats the empty string
  as no error and shows the settings again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import ShareInvite from "../../../../registry/blocks/share-invite/svelte/ShareInvite.svelte";

  type State =
    | "default"
    | "widths"
    | "invite-fails"
    | "empty"
    | "loading"
    | "error"
    | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const errorMessage = {
    en: "We could not load the sharing settings.",
    es: "No pudimos cargar los ajustes para compartir.",
  }[locale];

  const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 600));
  const sendInvite = () => wait();
  const failInvite = () => wait().then(() => Promise.reject(new Error("invite failed")));

  let error = $state(errorMessage);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <ShareInvite oninvite={sendInvite} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <ShareInvite oninvite={sendInvite} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <ShareInvite oninvite={sendInvite} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><ShareInvite oninvite={sendInvite} /></div>
        </div>
      </div>
    </div>
  {:else if shown === "invite-fails"}
    <ShareInvite oninvite={failInvite} />
  {:else if shown === "empty"}
    <ShareInvite members={[]} oninvite={sendInvite} />
  {:else if shown === "loading"}
    <ShareInvite loading />
  {:else if shown === "error"}
    <ShareInvite {error} onretry={() => (error = "")} oninvite={sendInvite} />
  {:else if shown === "disabled"}
    <ShareInvite disabled />
  {:else}
    <ShareInvite oninvite={sendInvite} />
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
