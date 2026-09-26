<!--
  The sign-in screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width — a phone below the screen's first step,
  a tablet and a desktop above its second. With `state` it mounts that one
  state alone at the tablet width, for an Examples preview. Only one copy of the
  screen is ever mounted per island.

  This is the registry source itself (registry/screens/sign-in/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add sign-in-svelte`
  writes into a consumer project, and the card inside it is the registry
  login-form the CLI installs alongside it (astro.config.mjs resolves the
  screen's `@/components/blocks/…` import back to it), so nothing here can drift from
  what ships.

  A screen owns the viewport, so its root is `min-h-dvh`: each device below
  (DeviceFrame) makes its own screen the viewport. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  phone tab stacks its masthead and footer while the wider two do not.
-->
<script lang="ts">
  import SignIn from "../../../../registry/screens/sign-in/svelte/SignIn.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "error" | "loading";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Sign-in screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      error: "Those credentials did not match. Check them and try again.",
    },
    es: {
      label: "Anchos de la pantalla de inicio de sesión",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      error: "Esas credenciales no coinciden. Revísalas e inténtalo de nuevo.",
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
    {#if id === "error"}
      <SignIn error={copy.error} />
    {:else if id === "loading"}
      <SignIn loading />
    {:else}
      <SignIn />
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
     `registry/screens/sign-in` changes — this rule is the frame telling the
     screen how big the window is, which is exactly what a real viewport does. */
  :global(.screen-window .moderno-screen-sign-in),
  :global(.screen-window .moderno-screen-sign-in > div) {
    min-block-size: 100%;
  }
</style>
