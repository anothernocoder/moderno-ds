<!--
  The welcome screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width — a phone below the screen's first step,
  a tablet and a desktop above its second. With `state` it mounts that one
  state alone at the tablet width, for an Examples preview. Only one copy of the
  screen is ever mounted per island.

  This is the registry source itself (registry/screens/welcome/svelte), and the
  hero inside it is the registry block the CLI installs alongside it
  (astro.config.mjs resolves the screen's `@/components/blocks/…` import back to
  it), so nothing here can drift from what ships.

  The error copy holds its message as a string, and "Try again" clears it to
  "", the way a consumer does once the retry succeeds.
-->
<script lang="ts">
  import Welcome from "../../../../registry/screens/welcome/svelte/Welcome.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "named" | "loading" | "error";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown }: { locale?: "en" | "es"; state?: State } = $props();

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Welcome screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      error: "We could not prepare your workspace.",
    },
    es: {
      label: "Anchos de la pantalla de bienvenida",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      error: "No pudimos preparar tu espacio de trabajo.",
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
    {#if id === "named"}
      <Welcome name="Ana" />
    {:else if id === "loading"}
      <Welcome loading />
    {:else if id === "error"}
      <Welcome {error} onretry={() => (error = "")} />
    {:else}
      <Welcome />
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
  /* Inside a device frame, "the window" is the frame: the screen's `min-h-dvh`
     fills the frame instead of the browser window, so the preview does not bury
     the page. The shipped file is unchanged. */
  :global(.screen-window .moderno-screen-welcome),
  :global(.screen-window .moderno-screen-welcome > div) {
    min-block-size: 100%;
  }
</style>
