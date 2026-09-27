<!--
  The confirmation screen, in two shapes. With no `state` it is the page's
  main preview: one tab per container width — a phone below the screen's
  first step, a tablet where the order summary still sits under the thank-you,
  and a desktop where the screen has crossed its `@lg` step and sets the
  summary beside it. With `state` it mounts that one state alone at the tablet
  width, for an Examples preview. Only one copy of the screen is ever mounted
  per island.

  This is the registry source itself (registry/screens/confirmation/svelte),
  and the order-summary block inside it is the registry block the CLI installs
  alongside it (astro.config.mjs resolves the screen's
  `@/components/blocks/…` import back to it), so nothing here can drift from
  what ships.

  "Continue shopping" is a callback, so it never leaves the page. "Try again"
  clears the order error, the way a consumer would once the order loads. The
  images are the order-summary block's local illustrations, so the page loads
  no third-party image.
-->
<script lang="ts">
  import Confirmation from "../../../../registry/screens/confirmation/svelte/Confirmation.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";
  import mugImage from "../assets/order-summary/mug.svg?url";
  import bowlImage from "../assets/order-summary/bowl.svg?url";
  import vaseImage from "../assets/order-summary/vase.svg?url";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "loading" | "order-error" | "empty";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown }: { locale?: "en" | "es"; state?: State } = $props();

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Confirmation screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      orderError: "We could not load your order.",
      mug: "A dark green stoneware mug with a bare clay foot",
      bowl: "A wide cream bowl with a brown glaze inside",
      vase: "A rust-red vase with a narrow neck",
    },
    es: {
      label: "Anchos de la pantalla de confirmación",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      orderError: "No pudimos cargar tu pedido.",
      mug: "Una taza de gres verde oscuro con la base de barro sin esmaltar",
      bowl: "Un cuenco ancho color crema con esmalte marrón por dentro",
      vase: "Un jarrón rojo óxido de cuello estrecho",
    },
  }[locale];

  const items = [
    {
      id: "stoneware-mug",
      name: "Stoneware mug",
      price: "€56",
      quantity: 2,
      options: "Sage · 350 ml",
      href: "#",
      image: { src: mugImage, alt: copy.mug },
    },
    {
      id: "serving-bowl",
      name: "Serving bowl",
      price: "€46",
      quantity: 1,
      options: "Oat · Large",
      href: "#",
      image: { src: bowlImage, alt: copy.bowl },
    },
    {
      id: "bud-vase",
      name: "Bud vase",
      price: "€32",
      quantity: 1,
      options: "Charcoal",
      href: "#",
      image: { src: vaseImage, alt: copy.vase },
    },
  ];

  const totals = [
    { label: "Subtotal", amount: "€134" },
    { label: "Shipping", amount: "€6" },
    { label: "Taxes", amount: "€28" },
  ];
  const total = "€168";

  const order = { orderNumber: "#MD-10482", delivery: "Tue, 6 October", email: "ana@example.com" };

  let error = $state(copy.orderError);

  /** The width tabs are their own frame; every state is shown at the tablet width. */
  function frameOf(id: string): Frame {
    return id === "phone" || id === "desktop" ? id : "tablet";
  }
</script>

{#snippet screen(id: string)}
  {@const frame = frameOf(id)}
  <DeviceFrame device={frame}>
    {#if id === "loading"}
      <Confirmation {...order} loading />
    {:else if id === "order-error"}
      <Confirmation {...order} {error} onretry={() => (error = "")} />
    {:else if id === "empty"}
      <Confirmation {...order} items={[]} />
    {:else}
      <Confirmation {...order} {items} {totals} {total} />
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
     the page. Nothing in `registry/screens/confirmation` changes. */
  :global(.screen-window .moderno-screen-confirmation),
  :global(.screen-window .moderno-screen-confirmation > div) {
    min-block-size: 100%;
  }
</style>
