<!--
  The slide-over block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/slide-over/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the trigger full width,
  each term above its value), 30rem sits between `--container-sm` and
  `--container-md` (the trigger at its own width, each term beside its value),
  40rem between `--container-md` and `--container-lg` (a larger heading) and
  50rem crosses `--container-lg` (the trigger beside the name, more room above
  and below). The docs column never reaches the 48rem `@lg` step, so the wide
  frame holds a 50rem stage and scrolls sideways inside itself; the page never
  does.

  Most states live inside the drawer, so each copy shows the panel and its
  state appears once the drawer opens. The default copy binds `open` and
  answers "Save changes" the way a consumer does: it takes the saved record and
  closes the drawer. The error copy clears its message when saved again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import SlideOver from "../../../../registry/blocks/slide-over/svelte/SlideOver.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: { error: "We could not save your changes." },
    es: { error: "No pudimos guardar los cambios." },
  }[locale];

  const blank = { name: "Grace Hopper", email: "grace@example.com", role: "", notes: "" };

  let record = $state<typeof blank | undefined>(undefined);
  let open = $state(false);
  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <SlideOver />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <SlideOver />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <SlideOver />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><SlideOver /></div>
        </div>
      </div>
    </div>
  {:else if shown === "empty"}
    <SlideOver record={blank} />
  {:else if shown === "loading"}
    <SlideOver loading />
  {:else if shown === "error"}
    <SlideOver {error} onsave={() => (error = "")} />
  {:else if shown === "disabled"}
    <SlideOver disabled />
  {:else}
    <SlideOver
      {record}
      bind:open
      onsave={(next) => {
        record = next;
        open = false;
      }}
    />
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
