<!--
  The reset-password screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width, spanning the screen's two steps. With
  `state` it mounts that one state alone at the tablet width, for an Examples
  preview. Only one copy of the screen is ever mounted per island.

  This is the registry source itself (registry/screens/reset-password/svelte),
  not a copy — what renders below is byte-for-byte what `moderno add
  reset-password-svelte` writes into a consumer project, and the card inside it
  is the registry login-form (in its reset-password mode) the CLI installs
  alongside it (astro.config.mjs resolves the screen's `@/components/blocks/…`
  import back to it), so nothing here can drift from what ships.

  Every copy carries a token, because that is how this screen is ever reached:
  from a link in an email. It rides in a hidden input inside the form, so the
  reset posts on a page whose JavaScript never arrived.

  A screen owns the viewport, so its root is `min-h-dvh`: each device below
  (DeviceFrame) makes its own screen the viewport. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  phone tab disagrees with the other two on one screen.
-->
<script lang="ts">
  import ResetPassword from "../../../../registry/screens/reset-password/svelte/ResetPassword.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "feedback" | "error" | "field-error";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  /** Stands in for the token a real link carries in its query string. */
  const token = "8f14e45fceea167a5a36dedd4bea2543";

  /**
   * The rules as they read once a long-enough password with mixed case is typed.
   * They are the block's own default rules, untranslated, so the only thing this
   * state changes against the default is `met`.
   */
  const halfMet = [
    { id: "length", label: "At least 12 characters", met: true },
    { id: "case", label: "An upper and a lower case letter", met: true },
    { id: "symbol", label: "A number or a symbol" },
  ];

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Reset-password screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      error: "This link has expired. Ask for a new one from the sign-in page.",
      confirmError: "The two passwords do not match.",
    },
    es: {
      label: "Anchos de la pantalla de restablecer contraseña",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      error: "Este enlace ha caducado. Pide uno nuevo desde la página de inicio de sesión.",
      confirmError: "Las dos contraseñas no coinciden.",
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
    {#if id === "feedback"}
      <ResetPassword {token} requirements={halfMet} />
    {:else if id === "error"}
      <ResetPassword {token} disabled error={copy.error} />
    {:else if id === "field-error"}
      <ResetPassword {token} errors={{ confirmPassword: copy.confirmError }} />
    {:else}
      <ResetPassword {token} />
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
     `registry/screens/reset-password` changes — this rule is the frame telling
     the screen how big the window is, which is what a real viewport does. */
  :global(.screen-window .moderno-screen-reset-password),
  :global(.screen-window .moderno-screen-reset-password > div) {
    min-block-size: 100%;
  }
</style>
