<!--
  The forgot-password screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width, in and around the screen's two steps.
  With `state` it mounts that one state alone at the tablet width, for
  an Examples preview. Only one copy of the screen is ever mounted per island.

  This is the registry source itself (registry/screens/forgot-password/svelte),
  not a copy — what renders below is byte-for-byte what `moderno add
  forgot-password-svelte` writes into a consumer project, and the card inside it
  is the registry login-form (in its forgot-password mode) the CLI installs
  alongside it (astro.config.mjs resolves the screen's
  `@/components/blocks/…` imports back to it), so nothing here can drift from
  what ships.

  A screen owns the viewport, so its root is `min-h-dvh`: each device below
  (DeviceFrame) makes its own screen the viewport. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  phone tab stacks while the wider two do not, on one screen.
-->
<script lang="ts">
  import ForgotPassword from "../../../../registry/screens/forgot-password/svelte/ForgotPassword.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "sent" | "error" | "field-error";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Forgot-password screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      error: "We could not send the link. Try again in a moment.",
      emailError: "That does not look like an email address.",
    },
    es: {
      label: "Anchos de la pantalla de recuperar contraseña",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      error: "No pudimos enviar el enlace. Inténtalo de nuevo en un momento.",
      emailError: "Eso no parece una dirección de correo.",
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
    {#if id === "sent"}
      <ForgotPassword sent sentTo="ada@example.com" />
    {:else if id === "error"}
      <ForgotPassword error={copy.error} />
    {:else if id === "field-error"}
      <ForgotPassword errors={{ email: copy.emailError }} />
    {:else}
      <ForgotPassword />
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
     `registry/screens/forgot-password` changes — this rule is the frame telling
     the screen how big the window is, which is what a real viewport does. */
  :global(.screen-window .moderno-screen-forgot-password),
  :global(.screen-window .moderno-screen-forgot-password > div) {
    min-block-size: 100%;
  }
</style>
