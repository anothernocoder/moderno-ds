<!--
  The product-details block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/product-details/svelte),
  not a copy, so the demo cannot drift from the file the docs print underneath
  it.

  The block ships a sample product with no photos, since a consumer brings
  their own. The demo passes the same product with four local illustrations,
  so the page loads no third-party image; the "without photos" example leaves
  them out.

  The default copy is live, the way a consumer wires it: Add to cart reports
  the selection, the demo holds `adding` while its pretend request runs, then
  writes what was added into a visually hidden status line (where the e2e spec
  reads it) and lets the button go.

  `widths` frames the same file four times across the block's steps
  (ADR-0005): 18rem is below `--container-sm` (the quantity above the button),
  30rem sits between `--container-sm` and `--container-md` (the quantity
  beside the button), 40rem (or the column's width, when that is narrower)
  sits near `--container-md`, where the name steps up, and 50rem crosses
  `--container-lg` (the gallery beside the details). The docs column never
  reaches the 48rem `@lg` step, so the wide frame holds a 50rem stage and
  scrolls sideways inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the product again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import ProductDetails from "../../../../registry/blocks/product-details/svelte/ProductDetails.svelte";
  import frontImage from "../assets/product-details/mug-front.svg?url";
  import sideImage from "../assets/product-details/mug-side.svg?url";
  import topImage from "../assets/product-details/mug-top.svg?url";
  import pairImage from "../assets/product-details/mug-pair.svg?url";

  type State =
    | "default"
    | "widths"
    | "no-photos"
    | "sold-out"
    | "adding"
    | "empty"
    | "loading"
    | "error"
    | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: {
      error: "We could not load this product.",
      front: "A dark green stoneware mug with a bare clay foot, handle to the right",
      side: "The same mug turned round, handle to the left",
      top: "The mug from above, glazed dark green inside",
      pair: "The green mug beside an unglazed clay mug",
      added: "Added",
    },
    es: {
      error: "No pudimos cargar este producto.",
      front: "Una taza de gres verde oscuro con la base de barro sin esmaltar, el asa a la derecha",
      side: "La misma taza girada, el asa a la izquierda",
      top: "La taza vista desde arriba, esmaltada en verde oscuro por dentro",
      pair: "La taza verde junto a una taza de barro sin esmaltar",
      added: "Añadido",
    },
  }[locale];

  const images = [
    { src: frontImage, alt: copy.front },
    { src: sideImage, alt: copy.side },
    { src: topImage, alt: copy.top },
    { src: pairImage, alt: copy.pair },
  ];

  const options = [
    {
      name: "Colour",
      values: [
        { value: "sage", label: "Sage" },
        { value: "oat", label: "Oat" },
        { value: "charcoal", label: "Charcoal", soldOut: true },
      ],
    },
    {
      name: "Size",
      values: [
        { value: "250", label: "250 ml" },
        { value: "350", label: "350 ml" },
        { value: "450", label: "450 ml" },
      ],
    },
  ];

  const sections = [
    {
      title: "Details",
      body: "Stoneware, glazed inside and out. The foot is left bare, so you feel the clay.",
    },
    {
      title: "Care",
      body: "Safe in the dishwasher and the microwave. Avoid sudden changes of temperature.",
    },
    { title: "Shipping", body: "Ships in 2–3 working days. Free returns within 30 days." },
  ];

  const description =
    "Thrown and glazed by hand in small batches, so no two are quite the same. A wide handle and a heavy base keep it steady on the desk.";

  const product = { name: "Stoneware mug", price: "€28", description, images, options, sections };
  const withoutPhotos = { ...product, images: [] };
  const soldOut = {
    ...product,
    options: [
      options[0]!,
      { name: "Size", values: options[1]!.values.map((value) => ({ ...value, soldOut: true })) },
    ],
  };

  let adding = $state(false);
  let added = $state("");

  function addToCart(selection: { options: Record<string, string>; quantity: number }) {
    adding = true;
    added = "";
    setTimeout(() => {
      adding = false;
      const picked = Object.values(selection.options).join(", ");
      added = `${copy.added}: ${selection.quantity} × ${picked}`;
    }, 600);
  }

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <ProductDetails {product} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <ProductDetails {product} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <ProductDetails {product} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide">
            <ProductDetails {product} />
          </div>
        </div>
      </div>
    </div>
  {:else if shown === "no-photos"}
    <ProductDetails product={withoutPhotos} />
  {:else if shown === "sold-out"}
    <ProductDetails product={soldOut} />
  {:else if shown === "adding"}
    <ProductDetails {product} adding />
  {:else if shown === "empty"}
    <ProductDetails product={null} />
  {:else if shown === "loading"}
    <ProductDetails loading />
  {:else if shown === "error"}
    <ProductDetails {product} {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <ProductDetails {product} disabled />
  {:else}
    <ProductDetails {product} {adding} onaddtocart={addToCart} />
    <p class="sr-only" role="status" data-demo-added>{added}</p>
  {/if}
</div>

<style>
  /* The status line is visually hidden (absolute); it stays inside the demo. */
  .demo-state {
    position: relative;
  }
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
