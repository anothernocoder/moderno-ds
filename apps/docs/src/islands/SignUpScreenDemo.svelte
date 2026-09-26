<!--
  The sign-up screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width, one in each band of the screen's three
  steps. With `state` it mounts that one state alone at the tablet width, for
  an Examples preview. Only one copy of the screen is ever mounted per island.

  This is the registry source itself (registry/screens/sign-up/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add sign-up-svelte`
  writes into a consumer project, and the card inside it is the registry
  login-form the CLI installs alongside it, in its sign-up mode
  (astro.config.mjs resolves the screen's `@/components/blocks/…` import back to
  it), so nothing here can drift from what ships.

  A screen owns the viewport, so its root is `min-h-dvh`: each device below
  (DeviceFrame) makes its own screen the viewport. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  three width tabs disagree with each other on one screen.
-->
<script lang="ts">
  import SignUp from "../../../../registry/screens/sign-up/svelte/SignUp.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "error" | "field-errors" | "loading" | "empty";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Sign-up screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      error: "We could not create the account. Try again in a moment.",
      errors: {
        email: "That address already has an account.",
        password: "Twelve characters or more, please.",
      },
    },
    es: {
      label: "Anchos de la pantalla de registro",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      error: "No pudimos crear la cuenta. Inténtalo de nuevo en un momento.",
      errors: {
        email: "Esa dirección ya tiene una cuenta.",
        password: "Doce caracteres o más, por favor.",
      },
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
      <SignUp error={copy.error} />
    {:else if id === "field-errors"}
      <SignUp errors={copy.errors} />
    {:else if id === "loading"}
      <SignUp loading />
    {:else if id === "empty"}
      <SignUp highlights={[]} />
    {:else}
      <SignUp />
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
     `registry/screens/sign-up` changes — this rule is the frame telling the
     screen how big the window is, which is exactly what a real viewport does. */
  :global(.screen-window .moderno-screen-sign-up),
  :global(.screen-window .moderno-screen-sign-up > div) {
    min-block-size: 100%;
  }
</style>
