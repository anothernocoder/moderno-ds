<!--
  The invite team screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width — a phone below the screen's first step,
  a tablet and a desktop above its second. With `state` it mounts that one state
  alone at the tablet width, for an Examples preview. Only one copy of the
  screen is ever mounted per island.

  This is the registry source itself (registry/screens/invite-team/svelte), not
  a copy — what renders below is what `moderno add invite-team-svelte` writes
  into a consumer project, and the pending list inside it is the registry list
  block the CLI installs alongside it (astro.config.mjs resolves the screen's
  `@/components/blocks/…` import back to it).

  A screen owns the viewport, so its root is `min-h-dvh`: each device below
  (DeviceFrame) makes its own screen the viewport. Every width decision is read
  off the screen's own container (ADR-0005).
-->
<script lang="ts">
  import InviteTeam from "../../../../registry/screens/invite-team/svelte/InviteTeam.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "invalid" | "send-error" | "sending" | "loading" | "list-error" | "empty";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Invite team screen widths",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      emailsError: "“ben@example” is not an email address.",
      sendError: "We could not send the invites. Try again in a moment.",
      listError: "We could not load your pending invites.",
    },
    es: {
      label: "Anchos de la pantalla de invitar al equipo",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      emailsError: "«ben@example» no es una dirección de correo.",
      sendError: "No pudimos enviar las invitaciones. Inténtalo de nuevo en un momento.",
      listError: "No pudimos cargar tus invitaciones pendientes.",
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
    {#if id === "invalid"}
      <InviteTeam emailsError={copy.emailsError} />
    {:else if id === "send-error"}
      <InviteTeam sendError={copy.sendError} />
    {:else if id === "sending"}
      <InviteTeam sending />
    {:else if id === "loading"}
      <InviteTeam invitesLoading />
    {:else if id === "list-error"}
      <InviteTeam invitesError={copy.listError} />
    {:else if id === "empty"}
      <InviteTeam invites={[]} />
    {:else}
      <InviteTeam />
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
     `registry/screens/invite-team` changes — this rule is the frame telling the
     screen how big the window is, which is what a real viewport does. */
  :global(.screen-window .moderno-screen-invite-team),
  :global(.screen-window .moderno-screen-invite-team > div) {
    min-block-size: 100%;
  }
</style>
