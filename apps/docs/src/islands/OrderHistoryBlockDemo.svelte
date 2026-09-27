<!--
  The order-history block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/order-history/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  The block ships sample orders with no images, since a consumer brings their
  own photos. The demo passes the same orders with three local illustrations,
  so the page loads no third-party image; the "without images" example leaves
  them out.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the order facts stacked,
  a full-width button, small images), 30rem sits between `--container-sm` and
  `--container-md` (the facts side by side, the button beside them, larger
  images), 40rem between `--container-md` and `--container-lg` (the quantity in
  its own column, a larger heading) and 50rem crosses `--container-lg` (more
  room above, below and between the orders). The docs column never reaches the
  48rem `@lg` step, so the wide frame holds a 50rem stage and scrolls sideways
  inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the orders again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import OrderHistory from "../../../../registry/blocks/order-history/svelte/OrderHistory.svelte";
  import mugImage from "../assets/order-history/mug.svg?url";
  import bowlImage from "../assets/order-history/bowl.svg?url";
  import vaseImage from "../assets/order-history/vase.svg?url";

  type State =
    | "default"
    | "widths"
    | "statuses"
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
      error: "We could not load your orders.",
      mug: "A dark green stoneware mug with a bare clay foot",
      bowl: "A wide cream bowl with a brown glaze inside",
      vase: "A rust-red vase with a narrow neck",
    },
    es: {
      error: "No pudimos cargar tus pedidos.",
      mug: "Una taza de gres verde oscuro con la base de barro sin esmaltar",
      bowl: "Un cuenco ancho color crema con esmalte marrón por dentro",
      vase: "Un jarrón rojo óxido de cuello estrecho",
    },
  }[locale];

  const mug = { src: mugImage, alt: copy.mug };
  const bowl = { src: bowlImage, alt: copy.bowl };
  const vase = { src: vaseImage, alt: copy.vase };

  const orders = [
    {
      id: "wu88191111",
      number: "WU88191111",
      date: "6 Jan 2026",
      total: "€134",
      status: "Shipped",
      statusVariant: "info" as const,
      items: [
        { id: "stoneware-mug", name: "Stoneware mug", price: "€56", quantity: 2, image: mug },
        { id: "serving-bowl", name: "Serving bowl", price: "€46", quantity: 1, image: bowl },
        { id: "bud-vase", name: "Bud vase", price: "€32", quantity: 1, image: vase },
      ],
    },
    {
      id: "wu88191009",
      number: "WU88191009",
      date: "18 Dec 2025",
      total: "€92",
      status: "Delivered",
      statusVariant: "success" as const,
      items: [{ id: "serving-bowl", name: "Serving bowl", price: "€92", quantity: 2, image: bowl }],
    },
    {
      id: "wu88190874",
      number: "WU88190874",
      date: "2 Nov 2025",
      total: "€32",
      status: "Cancelled",
      statusVariant: "error" as const,
      items: [{ id: "bud-vase", name: "Bud vase", price: "€32", quantity: 1, image: vase }],
    },
  ];

  const otherStatuses = [
    {
      id: "wu88191204",
      number: "WU88191204",
      date: "9 Jan 2026",
      total: "€56",
      status: "Processing",
      statusVariant: "warning" as const,
      items: [{ id: "stoneware-mug", name: "Stoneware mug", price: "€56", quantity: 2, image: mug }],
    },
    {
      id: "wu88190512",
      number: "WU88190512",
      date: "14 Sep 2025",
      total: "€46",
      status: "Returned",
      items: [{ id: "serving-bowl", name: "Serving bowl", price: "€46", quantity: 1, image: bowl }],
    },
  ];

  const withoutImages = orders.map((order) => ({
    ...order,
    items: order.items.map(({ image: _image, ...item }) => item),
  }));

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <OrderHistory {orders} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <OrderHistory {orders} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <OrderHistory {orders} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide">
            <OrderHistory {orders} />
          </div>
        </div>
      </div>
    </div>
  {:else if shown === "statuses"}
    <OrderHistory orders={otherStatuses} />
  {:else if shown === "no-images"}
    <OrderHistory orders={withoutImages} />
  {:else if shown === "empty"}
    <OrderHistory orders={[]} />
  {:else if shown === "loading"}
    <OrderHistory loading />
  {:else if shown === "error"}
    <OrderHistory {orders} {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <OrderHistory {orders} disabled />
  {:else}
    <OrderHistory {orders} />
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
