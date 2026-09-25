<!--
  The verify screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width, one in each band of the screen's three
  steps. With `state` it mounts that one state alone at the tablet width, for
  an Examples preview. Only one copy of the screen is ever mounted per island.

  This is the registry source itself (registry/screens/verify/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add verify-svelte`
  writes into a consumer project, and the card and the notes inside it are the
  registry login-form (in its verify mode) and alert-list the CLI installs
  alongside it (astro.config.mjs resolves the screen's `@/components/blocks/…`
  imports back to them), so nothing here can drift from what ships.

  Every copy names an address, because that is how this screen is ever reached:
  straight after an account was created with it. It rides in a hidden input
  beside the code, so a resend still posts on a page whose JavaScript never
  arrived.

  The cells are typed and pasted into for real: Ark moves the focus as digits
  land, distributes a pasted code across them, and flags the root complete once
  every cell holds a character.

  A screen owns the viewport, so its root is `min-h-dvh`: each frame below caps
  its height and scrolls, the way a phone or a laptop crops a page. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  three width tabs disagree with each other on one screen — and why the widest
  one scrolls sideways inside the docs column rather than waiting for a wide
  monitor.
-->
<script lang="ts">
  import Verify from "../../../../registry/screens/verify/svelte/Verify.svelte";
  import DemoTabs from "./DemoTabs.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "field-error" | "resend-locked" | "error" | "empty";

  let { locale = "en", state }: { locale?: "en" | "es"; state?: State } = $props();

  /** The address the code went to; a real page reads it off the session. */
  const sentTo = "ada@example.com";

  /** One frame width in each band of the screen's three container steps. */
  const widths = { phone: "22rem", tablet: "42rem", desktop: "62rem" } as const;
  type Frame = keyof typeof widths;

  const copy = {
    en: {
      label: "Verify screen widths",
      frames: { phone: "phone", tablet: "tablet", desktop: "desktop" },
      tabs: [
        { id: "phone", icon: "phone", label: "Phone", caption: "Under --container-sm the masthead, the footer and the notes all stack under the card." },
        { id: "tablet", icon: "tablet", label: "Tablet", caption: "Past --container-md and under --container-lg the masthead and the footer each sit on one row, the notes still under the card." },
        { id: "desktop", icon: "desktop", label: "Desktop", caption: "Past --container-lg the notes stand beside the card, so “look in spam” is read while the inbox is still open; this frame is wider than the docs column, so scroll it sideways." },
      ],
      codeError: "That code is not right. Check the newest email and try again.",
      error: "Too many attempts. Wait ten minutes, then ask for a new code.",
    },
    es: {
      label: "Anchos de la pantalla de verificación",
      frames: { phone: "teléfono", tablet: "tableta", desktop: "escritorio" },
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono", caption: "Por debajo de --container-sm la cabecera, el pie y las notas se apilan bajo la tarjeta." },
        { id: "tablet", icon: "tablet", label: "Tableta", caption: "Entre --container-md y --container-lg la cabecera y el pie ocupan una fila cada uno, y las notas siguen bajo la tarjeta." },
        { id: "desktop", icon: "desktop", label: "Escritorio", caption: "Por encima de --container-lg las notas se ponen junto a la tarjeta, así que «mira en spam» se lee con la bandeja aún abierta; este marco es más ancho que la columna de la documentación, así que desplázalo en horizontal." },
      ],
      codeError: "Ese código no es correcto. Revisa el correo más reciente e inténtalo de nuevo.",
      error: "Demasiados intentos. Espera diez minutos y pide un código nuevo.",
    },
  }[locale];

  /** The width tabs are their own frame; every state is shown at the tablet width. */
  function frameOf(id: string): Frame {
    return id === "phone" || id === "desktop" ? id : "tablet";
  }
</script>

{#snippet screen(id: string)}
  {@const frame = frameOf(id)}
  <div class="screen-scroll">
    <div
      class="demo-viewport screen-frame"
      style="--viewport-width: {widths[frame]}"
      data-label="{widths[frame]} · {copy.frames[frame]}"
    >
      <div class="screen-window">
        {#if id === "field-error"}
          <Verify {sentTo} errors={{ code: copy.codeError }} />
        {:else if id === "resend-locked"}
          <Verify {sentTo} resendIn={42} />
        {:else if id === "error"}
          <Verify {sentTo} disabled error={copy.error} />
        {:else if id === "empty"}
          <Verify {sentTo} notices={[]} />
        {:else}
          <Verify {sentTo} />
        {/if}
      </div>
    </div>
  </div>
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
  /* Each frame keeps the width its label names at every viewport — that is the
     whole claim of ADR-0005 — so a frame wider than the docs column scrolls
     inside the stage rather than being squeezed or pushing the page sideways.
     The block padding leaves room for the label straddling the frame's top
     edge, which the scroll box would otherwise clip. */
  .screen-scroll {
    overflow-x: auto;
    padding-block: 0.75rem 0.25rem;
  }
  /* The global dashed viewport, at exactly its content width: no inner padding
     and no `min(100%, …)` cap, because the screen reads its container and a
     capped frame would quietly move it into another band. */
  .screen-frame {
    width: calc(var(--viewport-width) + 2px);
    padding: 0;
  }
  /* The window the screen owns. The height is the demo's, not the design
     system's — the screen itself sizes only from contract slots and its own
     container. */
  .screen-window {
    block-size: 38rem;
    overflow: auto;
    border-radius: inherit;
  }
  /* The one thing the docs override on the shipped file, and only here: the
     screen's root is `min-h-dvh`, because a screen is as tall as the window it
     owns. A browser window's worth of screen inside a docs page would bury the
     prose, so inside this frame "the window" is the frame. Nothing in
     `registry/screens/verify` changes — this rule is the frame telling the
     screen how big the window is, which is what a real viewport does. */
  .screen-window :global(.moderno-screen-verify),
  .screen-window :global(.moderno-screen-verify > div) {
    min-block-size: 100%;
  }
</style>
