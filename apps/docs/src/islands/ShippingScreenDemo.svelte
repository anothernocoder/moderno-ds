<!--
  The shipping screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width — a phone below the screen's first
  step, a tablet between its second and third, a desktop above its third. With
  `state` it mounts that one state alone at the tablet width, for an Examples
  preview. Only one copy of the screen is ever mounted per island.

  This is the registry source itself (registry/screens/shipping/svelte), not a
  copy — what renders below is what `moderno add shipping-svelte` writes into a
  consumer project, and the form and the summary inside it are the registry
  checkout-form and order-summary blocks the CLI installs alongside it
  (astro.config.mjs resolves the screen's `@/components/blocks/…` imports back
  to them).

  A screen owns the viewport, so its root is `min-h-dvh`: each device below
  (DeviceFrame) makes its own screen the viewport. Every width decision is read
  off the screen's own container (ADR-0005).
-->
<script lang="ts">
  import Shipping from "../../../../registry/screens/shipping/svelte/Shipping.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "invalid" | "save-error" | "saving" | "loading" | "order-error" | "empty";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Shipping screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      fieldErrors: {
        email: "Enter an email address, like you@example.com.",
        postalCode: "Enter the postal code of the address.",
      },
      saveError: "We could not save your address.",
      orderError: "We could not load your order.",
    },
    es: {
      label: "Anchos de la pantalla de envío",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      fieldErrors: {
        email: "Escribe un correo, como tu@ejemplo.com.",
        postalCode: "Escribe el código postal de la dirección.",
      },
      saveError: "No pudimos guardar tu dirección.",
      orderError: "No pudimos cargar tu pedido.",
    },
  }[locale];

  /** The width tabs are their own frame; every state is shown at the tablet width. */
  function frameOf(id: string): Frame {
    return id === "phone" || id === "desktop" ? id : "tablet";
  }
</script>

{#snippet screen(id: string)}
  {@const frame = frameOf(id)}
  <DeviceFrame device={frame}>
    {#if id === "invalid"}
      <Shipping fieldErrors={copy.fieldErrors} />
    {:else if id === "save-error"}
      <Shipping saveError={copy.saveError} />
    {:else if id === "saving"}
      <Shipping saving />
    {:else if id === "loading"}
      <Shipping orderLoading />
    {:else if id === "order-error"}
      <Shipping orderError={copy.orderError} />
    {:else if id === "empty"}
      <Shipping items={[]} />
    {:else}
      <Shipping />
    {/if}
  </DeviceFrame>
{/snippet}

{#if state}
  <!-- One state, as its own example: the stage DemoTabs would draw, without the tab list. -->
  <div class="demo-tabs">
    <div class="demo-tabs-panel" data-demo-state={state}>
      <div class="demo-stage">{@render screen(state)}</div>
    </div>
  </div>
{:else}
  <DemoTabs tabs={copy.tabs} label={copy.label} stage={screen} />
{/if}

<style>
  /* The one thing the docs override on the shipped file, and only here: the
     screen's root is `min-h-dvh`, because a screen is as tall as the window it
     owns. A browser window's worth of screen inside a docs page would bury the
     prose, so inside this frame "the window" is the frame. Nothing in
     `registry/screens/shipping` changes — this rule is the frame telling the
     screen how big the window is, which is what a real viewport does. */
  :global(.screen-window .moderno-screen-shipping),
  :global(.screen-window .moderno-screen-shipping > div) {
    min-block-size: 100%;
  }
</style>
