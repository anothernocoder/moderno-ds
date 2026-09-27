<!--
  The product-list block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/product-list/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  The block ships sample products with no images, since a consumer brings their
  own photos. The demo passes the same products with four local illustrations,
  so the page loads no third-party image; the "without images" example leaves
  them out. The pagination is live: the block keeps its own page when no `page`
  is passed.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (two columns, the product
  count under the introduction), 30rem sits between `--container-sm` and
  `--container-md` (the count beside the heading), 40rem between
  `--container-md` and `--container-lg` (three columns and a larger heading)
  and 50rem crosses `--container-lg` (four columns with more room). The docs
  column never reaches the 48rem `@lg` step, so the wide frame holds a 50rem
  stage and scrolls sideways inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the products again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import ProductList from "../../../../registry/blocks/product-list/svelte/ProductList.svelte";
  import mugImage from "../assets/product-list/mug.svg?url";
  import bowlImage from "../assets/product-list/bowl.svg?url";
  import vaseImage from "../assets/product-list/vase.svg?url";
  import plateImage from "../assets/product-list/plate.svg?url";

  type State =
    | "default"
    | "widths"
    | "no-images"
    | "empty"
    | "loading"
    | "error"
    | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: {
      error: "We could not load the products.",
      mug: "A dark green stoneware mug with a bare clay foot",
      bowl: "A wide cream bowl with a brown glaze inside",
      vase: "A rust-red vase with a narrow neck",
      plate: "A slate-blue plate seen from the side",
    },
    es: {
      error: "No pudimos cargar los productos.",
      mug: "Una taza de gres verde oscuro con la base de barro sin esmaltar",
      bowl: "Un cuenco ancho color crema con esmalte marrón por dentro",
      vase: "Un jarrón rojo óxido de cuello estrecho",
      plate: "Un plato azul pizarra visto de lado",
    },
  }[locale];

  const mug = { src: mugImage, alt: copy.mug };
  const bowl = { src: bowlImage, alt: copy.bowl };
  const vase = { src: vaseImage, alt: copy.vase };
  const plate = { src: plateImage, alt: copy.plate };

  const products = [
    {
      id: "stoneware-mug",
      name: "Stoneware mug",
      price: "€28",
      compareAtPrice: "€35",
      badge: "Sale",
      href: "#",
      image: mug,
    },
    { id: "serving-bowl", name: "Serving bowl", price: "€46", href: "#", image: bowl },
    { id: "bud-vase", name: "Bud vase", price: "€32", badge: "New", href: "#", image: vase },
    { id: "dinner-plate", name: "Dinner plate", price: "€24", href: "#", image: plate },
    { id: "espresso-cup", name: "Espresso cup", price: "€18", href: "#", image: mug },
    { id: "pasta-bowl", name: "Pasta bowl", price: "€30", href: "#", image: bowl },
    { id: "tall-vase", name: "Tall vase", price: "€54", href: "#", image: vase },
    {
      id: "side-plate",
      name: "Side plate",
      price: "€16",
      compareAtPrice: "€19",
      badge: "Sale",
      href: "#",
      image: plate,
    },
    { id: "tea-mug", name: "Tea mug", price: "€26", href: "#", image: mug },
    { id: "salad-bowl", name: "Salad bowl", price: "€58", href: "#", image: bowl },
    { id: "stem-vase", name: "Stem vase", price: "€38", badge: "New", href: "#", image: vase },
    { id: "serving-platter", name: "Serving platter", price: "€64", image: plate },
  ];

  const total = 48;

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <ProductList {products} {total} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <ProductList {products} {total} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <ProductList {products} {total} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><ProductList {products} {total} /></div>
        </div>
      </div>
    </div>
  {:else if shown === "no-images"}
    <ProductList />
  {:else if shown === "empty"}
    <ProductList products={[]} />
  {:else if shown === "loading"}
    <ProductList loading />
  {:else if shown === "error"}
    <ProductList {products} {total} {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <ProductList {products} {total} disabled />
  {:else}
    <ProductList {products} {total} />
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
