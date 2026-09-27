<!--
  The product-card block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/product-card/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  The block ships a sample product with no image, since a consumer brings their
  own. The demo passes the same product with a local illustration, so the page
  loads no third-party image; the "no image" example leaves it out.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the image above the text),
  30rem sits between `--container-sm` and `--container-md` (the image beside the
  text), 40rem between `--container-md` and `--container-lg` (a larger name)
  and 50rem crosses `--container-lg` (an even split with a square image). The
  docs column never reaches the 48rem `@lg` step, so the wide frame holds a
  50rem stage and scrolls sideways inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the product again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import ProductCard from "../../../../registry/blocks/product-card/svelte/ProductCard.svelte";
  import mugImage from "../assets/product-card/stoneware-mug.svg?url";

  type State = "default" | "widths" | "no-image" | "empty" | "loading" | "error" | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: {
      error: "We could not load this product.",
      alt: "A dark green stoneware mug with a bare clay foot",
    },
    es: {
      error: "No pudimos cargar este producto.",
      alt: "Una taza de gres verde oscuro con la base de barro sin esmaltar",
    },
  }[locale];

  const product = {
    name: "Stoneware mug",
    price: "€28",
    compareAtPrice: "€35",
    description: "Glazed by hand in small batches. Holds 350 ml and goes in the dishwasher.",
    badge: "Sale",
    href: "#",
    image: { src: mugImage, alt: copy.alt },
  };

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <ProductCard {product} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <ProductCard {product} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <ProductCard {product} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><ProductCard {product} /></div>
        </div>
      </div>
    </div>
  {:else if shown === "no-image"}
    <ProductCard />
  {:else if shown === "empty"}
    <ProductCard product={null} />
  {:else if shown === "loading"}
    <ProductCard loading />
  {:else if shown === "error"}
    <ProductCard {product} {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <ProductCard {product} disabled />
  {:else}
    <ProductCard {product} />
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
