<!--
  The shopping-cart block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/shopping-cart/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  The block ships sample items with no images, since a consumer brings their
  own photos. The demo passes the same items with three local illustrations, so
  the page loads no third-party image; the "without images" example leaves them
  out.

  The default copy is live, the way a consumer wires it: it holds the cart in
  state, works out each line's price and the subtotal from the quantities, and
  drops a line when its Remove button is pressed. Removing every line shows the
  empty message.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (a small image, the
  quantity on its own row under it), 30rem sits between `--container-sm` and
  `--container-md` (a larger image, the quantity beside it), 40rem between
  `--container-md` and `--container-lg` (a larger image again, a larger
  heading) and 50rem crosses `--container-lg` (the summary beside the lines). The docs column never
  reaches the 48rem `@lg` step, so the wide frame holds a 50rem stage and
  scrolls sideways inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the cart again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import ShoppingCart from "../../../../registry/blocks/shopping-cart/svelte/ShoppingCart.svelte";
  import mugImage from "../assets/shopping-cart/mug.svg?url";
  import bowlImage from "../assets/shopping-cart/bowl.svg?url";
  import vaseImage from "../assets/shopping-cart/vase.svg?url";

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
      error: "We could not load your cart.",
      mug: "A dark green stoneware mug with a bare clay foot",
      bowl: "A wide cream bowl with a brown glaze inside",
      vase: "A rust-red vase with a narrow neck",
    },
    es: {
      error: "No pudimos cargar tu carrito.",
      mug: "Una taza de gres verde oscuro con la base de barro sin esmaltar",
      bowl: "Un cuenco ancho color crema con esmalte marrón por dentro",
      vase: "Un jarrón rojo óxido de cuello estrecho",
    },
  }[locale];

  const products = [
    {
      id: "stoneware-mug",
      name: "Stoneware mug",
      unitPrice: 28,
      quantity: 2,
      options: "Sage · 350 ml",
      href: "#",
      image: { src: mugImage, alt: copy.mug },
    },
    {
      id: "serving-bowl",
      name: "Serving bowl",
      unitPrice: 46,
      quantity: 1,
      options: "Oat · Large",
      href: "#",
      image: { src: bowlImage, alt: copy.bowl },
    },
    {
      id: "bud-vase",
      name: "Bud vase",
      unitPrice: 32,
      quantity: 1,
      options: "Charcoal",
      href: "#",
      image: { src: vaseImage, alt: copy.vase },
    },
  ];

  const euros = (amount: number) => `€${amount}`;

  let lines = $state(products.map(({ id, quantity }) => ({ id, quantity })));

  const items = $derived(
    lines.map((line) => {
      const { unitPrice, ...product } = products.find((p) => p.id === line.id)!;
      return { ...product, quantity: line.quantity, price: euros(unitPrice * line.quantity) };
    }),
  );
  const subtotal = $derived(
    euros(
      lines.reduce(
        (sum, line) => sum + products.find((p) => p.id === line.id)!.unitPrice * line.quantity,
        0,
      ),
    ),
  );

  function changeQuantity(id: string, quantity: number) {
    lines = lines.map((line) => (line.id === id ? { ...line, quantity } : line));
  }

  function remove(id: string) {
    lines = lines.filter((line) => line.id !== id);
  }

  const staticItems = products.map(({ unitPrice, ...product }) => ({
    ...product,
    price: euros(unitPrice * product.quantity),
  }));
  const staticSubtotal = "€134";
  const withoutImages = staticItems.map(({ image: _image, ...item }) => item);

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <ShoppingCart items={staticItems} subtotal={staticSubtotal} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <ShoppingCart items={staticItems} subtotal={staticSubtotal} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <ShoppingCart items={staticItems} subtotal={staticSubtotal} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide">
            <ShoppingCart items={staticItems} subtotal={staticSubtotal} />
          </div>
        </div>
      </div>
    </div>
  {:else if shown === "no-images"}
    <ShoppingCart items={withoutImages} subtotal={staticSubtotal} />
  {:else if shown === "empty"}
    <ShoppingCart items={[]} />
  {:else if shown === "loading"}
    <ShoppingCart loading />
  {:else if shown === "error"}
    <ShoppingCart items={staticItems} subtotal={staticSubtotal} {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <ShoppingCart items={staticItems} subtotal={staticSubtotal} disabled />
  {:else}
    <ShoppingCart {items} {subtotal} onquantitychange={changeQuantity} onremove={remove} />
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
