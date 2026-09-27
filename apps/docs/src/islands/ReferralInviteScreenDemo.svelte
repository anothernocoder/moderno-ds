<!--
  The referral invite screen, in two shapes. With no `state` it is the page's
  main preview: one tab per container width — a phone below the screen's first
  step, a tablet and a desktop above its second. With `state` it mounts that one
  state alone at the tablet width, for an Examples preview. Only one copy of the
  screen is ever mounted per island.

  This is the registry source itself (registry/screens/referral-invite/svelte),
  not a copy — what renders below is what `moderno add referral-invite-svelte`
  writes into a consumer project, and the form inside it is the registry
  form-layout the CLI installs alongside it (astro.config.mjs resolves the
  screen's `@/components/blocks/…` import back to it).

  A screen owns the viewport, so its root is `min-h-dvh`: each device below
  (DeviceFrame) makes its own screen the viewport. Every width decision is read
  off the screen's own container (ADR-0005).
-->
<script lang="ts">
  import ReferralInvite from "../../../../registry/screens/referral-invite/svelte/ReferralInvite.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "sent" | "error" | "loading" | "disabled";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  type Frame = "phone" | "tablet" | "desktop";

  const sent = ["ada@example.com", "grace@example.com"];

  const copy = {
    en: {
      label: "Referral invite screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      error: "We could not send your invites. Check the addresses below.",
      emails: "“grace@example” is not a full email address.",
      disabled: "You have sent 10 invites this week. You can send more on Monday.",
    },
    es: {
      label: "Anchos de la pantalla de invitación de referidos",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      error: "No pudimos enviar tus invitaciones. Revisa las direcciones de abajo.",
      emails: "“grace@example” no es una dirección de correo completa.",
      disabled: "Enviaste 10 invitaciones esta semana. Podrás enviar más el lunes.",
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
      <ReferralInvite {sent} />
    {:else if id === "error"}
      <ReferralInvite error={copy.error} errors={{ emails: copy.emails }} />
    {:else if id === "loading"}
      <ReferralInvite loading />
    {:else if id === "disabled"}
      <ReferralInvite error={copy.disabled} disabled />
    {:else}
      <ReferralInvite />
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
     `registry/screens/referral-invite` changes — this rule is the frame telling
     the screen how big the window is, which is what a real viewport does. */
  :global(.screen-window .moderno-screen-referral-invite),
  :global(.screen-window .moderno-screen-referral-invite > div) {
    min-block-size: 100%;
  }
</style>
