<!--
  The input-group block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/input-group/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm`, 30rem sits between
  `--container-sm` and `--container-md` (one column), 40rem between
  `--container-md` and `--container-lg` (a larger heading, the fields two-up)
  and 50rem crosses `--container-lg` (the heading beside the fields). The docs
  column never reaches the 48rem `@lg` step, so the wide frame holds a 50rem
  stage and scrolls sideways inside itself; the page never does.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import InputGroup from "../../../../registry/blocks/input-group/svelte/InputGroup.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const errors = {
    en: {
      website: "Enter an address like acme.shop, without spaces.",
      price: "Enter a price above zero.",
      query: "Type at least two letters.",
    },
    es: {
      website: "Escribe una dirección como acme.shop, sin espacios.",
      price: "Escribe un precio mayor que cero.",
      query: "Escribe al menos dos letras.",
    },
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <InputGroup />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <InputGroup />
      </div>
      <div data-demo-state="two-up" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <InputGroup />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><InputGroup /></div>
        </div>
      </div>
    </div>
  {:else if state === "empty"}
    <InputGroup website="" price="" apiKey="" />
  {:else if state === "loading"}
    <InputGroup query="Linen shirt" loading />
  {:else if state === "error"}
    <InputGroup website="acme shop" price="0" query="a" {errors} />
  {:else if state === "disabled"}
    <InputGroup disabled />
  {:else}
    <InputGroup />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     block instead of scrolling inside its own frame. */
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
