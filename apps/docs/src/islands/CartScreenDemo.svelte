<!--
  The cart screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width — a phone below the screen's first step,
  a tablet where the cart still stacks its summary under the lines, and a
  desktop where the block inside has crossed its own `@lg` step and sets the
  summary beside them. With `state` it mounts that one state alone at the
  tablet width, for an Examples preview. Only one copy of the screen is ever
  mounted per island.

  This is the registry source itself (registry/screens/cart/svelte), and the
  shopping-cart block inside it is the registry block the CLI installs
  alongside it (astro.config.mjs resolves the screen's `@/components/blocks/…`
  import back to it), so nothing here can drift from what ships.

  The main preview is wired the way a consumer wires it: it holds the cart in
  state, works out each line's price and the subtotal from the quantities, and
  drops a line when its Remove button is pressed. The images are the shopping
  cart block's local illustrations, so the page loads no third-party image.

  "Try again" clears the error, the way a consumer would once the cart loads.
-->
<script lang="ts">
  import Cart from "../../../../registry/screens/cart/svelte/Cart.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";
  import mugImage from "../assets/shopping-cart/mug.svg?url";
  import bowlImage from "../assets/shopping-cart/bowl.svg?url";
  import vaseImage from "../assets/shopping-cart/vase.svg?url";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "error" | "loading" | "empty";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown }: { locale?: "en" | "es"; state?: State } = $props();

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Cart screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      error: "We could not load your cart.",
      mug: "A dark green stoneware mug with a bare clay foot",
      bowl: "A wide cream bowl with a brown glaze inside",
      vase: "A rust-red vase with a narrow neck",
    },
    es: {
      label: "Anchos de la pantalla del carrito",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
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

  let error = $state(copy.error);

  /** The width tabs are their own frame; every state is shown at the tablet width. */
  function frameOf(id: string): Frame {
    return id === "phone" || id === "desktop" ? id : "tablet";
  }
</script>

{#snippet screen(id: string)}
  {@const frame = frameOf(id)}
  <DeviceFrame device={frame}>
    {#if id === "error"}
      <Cart {error} onretry={() => (error = "")} />
    {:else if id === "loading"}
      <Cart loading />
    {:else if id === "empty"}
      <Cart items={[]} />
    {:else}
      <Cart {items} {subtotal} onquantitychange={changeQuantity} onremove={remove} />
    {/if}
  </DeviceFrame>
{/snippet}

{#if shown}
  <!-- One state, as its own example: the stage DemoTabs would draw, without the tab list. -->
  <div class="demo-tabs">
    <div class="demo-tabs-panel" data-demo-state={shown}>
      <div class="demo-stage">{@render screen(shown)}</div>
    </div>
  </div>
{:else}
  <DemoTabs tabs={copy.tabs} label={copy.label} stage={screen} />
{/if}

<style>
  /* A screen is `min-h-dvh`: as tall as the window it owns. Inside this frame
     "the window" is the frame, so the screen fills the frame instead of burying
     the page. Nothing in `registry/screens/cart` changes. */
  :global(.screen-window .moderno-screen-cart),
  :global(.screen-window .moderno-screen-cart > div) {
    min-block-size: 100%;
  }
</style>
