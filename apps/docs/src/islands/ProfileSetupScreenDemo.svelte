<!--
  The profile setup screen, in two shapes. With no `state` it is the page's
  main preview: one tab per container width — a phone below the screen's first
  step, a tablet and a desktop above its second. With `state` it mounts that one
  state alone at the tablet width, for an Examples preview. Only one copy of the
  screen is ever mounted per island.

  This is the registry source itself (registry/screens/profile-setup/svelte),
  not a copy — what renders below is what `moderno add profile-setup-svelte`
  writes into a consumer project, and the form inside it is the registry
  form-layout the CLI installs alongside it (astro.config.mjs resolves the
  screen's `@/components/blocks/…` import back to it).

  A screen owns the viewport, so its root is `min-h-dvh`: each device below
  (DeviceFrame) makes its own screen the viewport. Every width decision is read
  off the screen's own container (ADR-0005).
-->
<script lang="ts">
  import ProfileSetup from "../../../../registry/screens/profile-setup/svelte/ProfileSetup.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "photo" | "uploading" | "photo-error" | "error" | "loading" | "empty";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  /**
   * A stand-in for an uploaded photo, inline so the demo needs no network: a
   * real page passes the URL its upload returned.
   */
  const photo =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
        '<rect width="64" height="64" fill="#3f4a5a"/>' +
        '<circle cx="32" cy="25" r="11" fill="#d9c2a7"/>' +
        '<path d="M12 64a20 20 0 0 1 40 0z" fill="#8a6b52"/>' +
        "</svg>",
    );

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Profile setup screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      photoError: "That file is larger than 5 MB. Pick a smaller photo.",
      error: "We could not save your profile. Check the fields below.",
      fullName: "Enter your full name.",
    },
    es: {
      label: "Anchos de la pantalla de configuración del perfil",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      photoError: "Ese archivo pesa más de 5 MB. Elige una foto más pequeña.",
      error: "No pudimos guardar tu perfil. Revisa los campos de abajo.",
      fullName: "Escribe tu nombre completo.",
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
    {#if id === "photo"}
      <ProfileSetup initials="AL" avatarSrc={photo} />
    {:else if id === "uploading"}
      <ProfileSetup initials="AL" avatarUploading />
    {:else if id === "photo-error"}
      <ProfileSetup initials="AL" avatarError={copy.photoError} />
    {:else if id === "error"}
      <ProfileSetup initials="AL" error={copy.error} errors={{ fullName: copy.fullName }} />
    {:else if id === "loading"}
      <ProfileSetup initials="AL" avatarSrc={photo} loading />
    {:else if id === "empty"}
      <ProfileSetup />
    {:else}
      <ProfileSetup initials="AL" />
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
     `registry/screens/profile-setup` changes — this rule is the frame telling
     the screen how big the window is, which is what a real viewport does. */
  :global(.screen-window .moderno-screen-profile-setup),
  :global(.screen-window .moderno-screen-profile-setup > div) {
    min-block-size: 100%;
  }
</style>
