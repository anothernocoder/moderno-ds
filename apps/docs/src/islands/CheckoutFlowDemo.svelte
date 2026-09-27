<!--
  The checkout flow, live and walkable, in two shapes. With no `example` it is
  the page's main preview: one tab per frame width, desktop last, and under the
  frame a readout of what the assembly told the page it was doing. Only the
  active tab's copy is mounted (DemoTabs), so switching tabs starts a fresh walk
  at `cart` and the readout starts over with it. With `example` it mounts that
  one example alone at the tablet width, for an Examples preview.

  This is the registry source itself (registry/flows/checkout/svelte), not a
  copy, and the five screens inside it are the registry screens the CLI
  installs alongside it (astro.config.mjs resolves the assembly's
  `@/components/screens/…` imports back to them), so nothing here can drift
  from what ships.

  The walk, with nothing faked but the server:

    cart →[Checkout]→ shipping →[every field, Continue to payment]→ payment
         →[every field, Place order]→ review →[Place order]→ confirmation
         →[Continue shopping]→ cart, now empty

  The readout is the docs', not the design system's: it prints the
  `onstepchange`, `onorderplaced` and `oncontinueshopping` callbacks as they
  fire. The images are the order-summary block's local illustrations, so the
  page loads no third-party image.
-->
<script lang="ts">
  import CheckoutFlow from "../../../../registry/flows/checkout/svelte/CheckoutFlow.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";
  import mugImage from "../assets/order-summary/mug.svg?url";
  import bowlImage from "../assets/order-summary/bowl.svg?url";
  import vaseImage from "../assets/order-summary/vase.svg?url";

  type CheckoutStep = "cart" | "shipping" | "payment" | "review" | "confirmation";

  /** Mount one example on its own (an Examples preview) instead of the frame tabs. */
  type Example = "empty-cart" | "opens-at-shipping";

  let { locale = "en", example }: { locale?: "en" | "es"; example?: Example } = $props();

  /** The flow in order — what the readout walks, and what the assembly sequences. */
  const steps: CheckoutStep[] = ["cart", "shipping", "payment", "review", "confirmation"];

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Checkout flow frames",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      readout: "What the assembly reported",
      empty: "Nothing yet — move the flow above.",
      note: "The three callbacks the assembly hands up: the step it moved to, for your router; the order it placed, for your server; and Continue shopping, for wherever your shop begins.",
      mug: "A dark green stoneware mug with a bare clay foot",
      bowl: "A wide cream bowl with a brown glaze inside",
      vase: "A rust-red vase with a narrow neck",
    },
    es: {
      label: "Marcos del flujo de compra",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      readout: "Lo que informó el ensamblaje",
      empty: "Nada todavía — mueve el flujo de arriba.",
      note: "Los tres callbacks que el ensamblaje devuelve: el paso al que se movió, para tu router; el pedido que hizo, para tu servidor; y Seguir comprando, para donde empiece tu tienda.",
      mug: "Una taza de gres verde oscuro con la base de barro sin esmaltar",
      bowl: "Un cuenco ancho color crema con esmalte marrón por dentro",
      vase: "Un jarrón rojo óxido de cuello estrecho",
    },
  }[locale];

  const lines = [
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

  let step = $state<CheckoutStep>("cart");
  let events = $state<string[]>([]);

  function record(line: string) {
    events = [line, ...events].slice(0, 6);
  }

  function onstepchange(next: CheckoutStep) {
    step = next;
    record(`onstepchange("${next}")`);
  }

  function onorderplaced(order: { number: string; total: number }) {
    record(`onorderplaced({ number: "${order.number}", total: ${order.total} })`);
  }

  function oncontinueshopping() {
    record("oncontinueshopping()");
  }

  function frameOf(id: string): Frame {
    return id === "phone" || id === "desktop" ? id : "tablet";
  }

  /** A tab mounts a fresh flow at its first step, so the readout starts over too. */
  function fresh() {
    step = "cart";
    events = [];
  }
</script>

{#if example}
  <!-- One example on its own: the stage DemoTabs would draw, without the tab list. -->
  <div class="demo-tabs">
    <div class="demo-tabs-panel" data-demo-state={example}>
      <div class="demo-stage">
        <DeviceFrame device="tablet">
          {#if example === "empty-cart"}
            <CheckoutFlow initialLines={[]} />
          {:else}
            <CheckoutFlow initialLines={lines} initialStep="shipping" />
          {/if}
        </DeviceFrame>
      </div>
    </div>
  </div>
{:else}
  <DemoTabs tabs={copy.tabs} label={copy.label}>
    {#snippet stage(id)}
      <div class="checkout-stage" {@attach fresh}>
        <DeviceFrame device={frameOf(id)}>
          <CheckoutFlow
            initialLines={lines}
            {onstepchange}
            {onorderplaced}
            {oncontinueshopping}
          />
        </DeviceFrame>

        <div class="demo-readout" role="group" aria-label={copy.readout}>
          <ol class="demo-steps">
            {#each steps as name (name)}
              <li
                class:is-current={step === name}
                aria-current={step === name ? "step" : undefined}
              >
                <code>{name}</code>
              </li>
            {/each}
          </ol>
          <ul class="demo-events">
            {#if events.length === 0}
              <li class="demo-events-empty">{copy.empty}</li>
            {:else}
              {#each events as line, index (`${index}-${line}`)}
                <li><code>{line}</code></li>
              {/each}
            {/if}
          </ul>
          <p class="demo-readout-note">{copy.note}</p>
        </div>
      </div>
    {/snippet}
  </DemoTabs>
{/if}

<style>
  .checkout-stage {
    display: grid;
    gap: var(--spacing-6);
  }
  /* A screen is `min-h-dvh`: as tall as the window it owns. Inside this frame
     "the window" is the frame, so the screen fills the frame instead of burying
     the page. The flow's own wrapper is in the chain, so it carries the height
     through. Nothing in `registry/` changes. */
  :global(.screen-window .moderno-flow-checkout) {
    block-size: 100%;
  }
  :global(.screen-window .moderno-flow-checkout > div),
  :global(.screen-window .moderno-flow-checkout > div > div) {
    min-block-size: 100%;
  }
  .demo-readout {
    display: grid;
    gap: var(--spacing-3);
    max-inline-size: 62rem;
    margin-inline: auto;
    inline-size: 100%;
  }
  .demo-steps {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .demo-steps li {
    padding: var(--spacing-1) var(--spacing-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--muted-foreground);
  }
  .demo-steps li.is-current {
    border-color: var(--primary);
    color: var(--foreground);
  }
  .demo-events {
    display: grid;
    gap: var(--spacing-1);
    margin: 0;
    padding: 0;
    list-style: none;
    min-block-size: 6rem;
    align-content: start;
  }
  .demo-events-empty {
    color: var(--muted-foreground);
  }
  .demo-readout-note {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.5;
  }
</style>
