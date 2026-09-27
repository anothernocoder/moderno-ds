<!--
  The referral reward screen, in two shapes. With no `state` it is the page's
  main preview: one tab per container width — a phone below the screen's first
  step, a tablet between its second and third, a desktop above its third. With
  `state` it mounts that one state alone at the tablet width, for an Examples
  preview. Only one copy of the screen is ever mounted per island.

  This is the registry source itself (registry/screens/referral-reward/svelte),
  not a copy — what renders below is what `moderno add referral-reward-svelte`
  writes into a consumer project, and the cards inside it are the registry
  kpi-card block the CLI installs alongside it (astro.config.mjs resolves the
  screen's `@/components/blocks/…` import back to it).

  A screen owns the viewport, so its root is `min-h-dvh`: each device below
  (DeviceFrame) makes its own screen the viewport. Every width decision is read
  off the screen's own container (ADR-0005).
-->
<script lang="ts">
  import ReferralReward from "../../../../registry/screens/referral-reward/svelte/ReferralReward.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "error" | "loading" | "empty";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  /** No referral activity yet: every card in its empty state. */
  const noActivity = [
    { id: "invited", label: "Friends invited", period: "All time", metric: null },
    { id: "joined", label: "Friends joined", period: "All time", metric: null },
    { id: "earned", label: "Months earned", period: "All time", metric: null },
  ];

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Referral reward screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      error: "We could not load your rewards.",
    },
    es: {
      label: "Anchos de la pantalla de recompensas por invitación",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      error: "No pudimos cargar tus recompensas.",
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
      <ReferralReward error={copy.error} />
    {:else if id === "loading"}
      <ReferralReward loading />
    {:else if id === "empty"}
      <ReferralReward stats={noActivity} />
    {:else}
      <ReferralReward />
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
     `registry/screens/referral-reward` changes — this rule is the frame telling
     the screen how big the window is, which is what a real viewport does. */
  :global(.screen-window .moderno-screen-referral-reward),
  :global(.screen-window .moderno-screen-referral-reward > div) {
    min-block-size: 100%;
  }
</style>
