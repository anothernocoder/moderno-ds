<!--
  The plan-select screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width — a phone below the screen's first step,
  a tablet and a desktop above its second. With `state` it mounts that one state
  alone at the tablet width, for an Examples preview. Only one copy of the
  screen is ever mounted per island.

  This is the registry source itself (registry/screens/plan-select/svelte), and
  the pricing block inside it is the registry block the CLI installs alongside
  it (astro.config.mjs resolves the screen's `@/components/blocks/…` import back
  to it), so nothing here can drift from what ships.

  "Try again" clears the error, the way a consumer would once the plans load.
-->
<script lang="ts">
  import PlanSelect from "../../../../registry/screens/plan-select/svelte/PlanSelect.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "error" | "loading" | "empty";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown }: { locale?: "en" | "es"; state?: State } = $props();

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Plan select screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      error: "We could not load the plans.",
    },
    es: {
      label: "Anchos de la pantalla de elección de plan",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      error: "No pudimos cargar los planes.",
    },
  }[locale];

  let error = $state(copy.error);

  /** The width tabs are their own frame; every state is shown at the tablet width. */
  function frameOf(id: string): Frame {
    return id === "phone" || id === "desktop" ? id : "tablet";
  }
</script>

{#snippet screen(id: string)}
  {@const frame = frameOf(id)}
  <DeviceFrame device={frame}>
    {#if id === "error"}
      <PlanSelect {error} onretry={() => (error = "")} />
    {:else if id === "loading"}
      <PlanSelect loading />
    {:else if id === "empty"}
      <PlanSelect plans={[]} />
    {:else}
      <PlanSelect />
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
     the page. Nothing in `registry/screens/plan-select` changes. */
  :global(.screen-window .moderno-screen-plan-select),
  :global(.screen-window .moderno-screen-plan-select > div) {
    min-block-size: 100%;
  }
</style>
