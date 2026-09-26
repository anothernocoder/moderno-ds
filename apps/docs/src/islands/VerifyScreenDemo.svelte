<!--
  The verify screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width, one in each band of the screen's two
  steps. With `state` it mounts that one state alone at the tablet width, for
  an Examples preview. Only one copy of the screen is ever mounted per island.

  This is the registry source itself (registry/screens/verify/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add verify-svelte`
  writes into a consumer project, and the card inside it is the registry
  login-form (in its verify mode) the CLI installs alongside it
  (astro.config.mjs resolves the screen's `@/components/blocks/…` imports back
  to it), so nothing here can drift from what ships.

  Every copy names an address, because that is how this screen is ever reached:
  straight after an account was created with it. It rides in a hidden input
  beside the code, so a resend still posts on a page whose JavaScript never
  arrived.

  The cells are typed and pasted into for real: Ark moves the focus as digits
  land, distributes a pasted code across them, and flags the root complete once
  every cell holds a character.

  A screen owns the viewport, so its root is `min-h-dvh`: each device below
  (DeviceFrame) makes its own screen the viewport. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  three width tabs disagree with each other on one screen.
-->
<script lang="ts">
  import Verify from "../../../../registry/screens/verify/svelte/Verify.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "field-error" | "resend-locked" | "error";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  /** The address the code went to; a real page reads it off the session. */
  const sentTo = "ada@example.com";

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Verify screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      codeError: "That code is not right. Check the newest email and try again.",
      error: "Too many attempts. Wait ten minutes, then ask for a new code.",
    },
    es: {
      label: "Anchos de la pantalla de verificación",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      codeError: "Ese código no es correcto. Revisa el correo más reciente e inténtalo de nuevo.",
      error: "Demasiados intentos. Espera diez minutos y pide un código nuevo.",
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
    {#if id === "field-error"}
      <Verify {sentTo} errors={{ code: copy.codeError }} />
    {:else if id === "resend-locked"}
      <Verify {sentTo} resendIn={42} />
    {:else if id === "error"}
      <Verify {sentTo} disabled error={copy.error} />
    {:else}
      <Verify {sentTo} />
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
     `registry/screens/verify` changes — this rule is the frame telling the
     screen how big the window is, which is what a real viewport does. */
  :global(.screen-window .moderno-screen-verify),
  :global(.screen-window .moderno-screen-verify > div) {
    min-block-size: 100%;
  }
</style>
