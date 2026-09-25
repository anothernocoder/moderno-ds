<!--
  The reset-password screen, in two shapes. With no `state` it is the page's main
  preview: one tab per container width, one in each band of the screen's three
  steps. With `state` it mounts that one state alone at the tablet width, for
  an Examples preview. Only one copy of the screen is ever mounted per island.

  This is the registry source itself (registry/screens/reset-password/svelte),
  not a copy — what renders below is byte-for-byte what `moderno add
  reset-password-svelte` writes into a consumer project, and the card and the
  notes inside it are the registry login-form (in its reset-password mode) and
  alert-list the CLI installs alongside it (astro.config.mjs resolves the
  screen's `@/components/blocks/…` imports back to them), so nothing here can
  drift from what ships.

  Every copy carries a token, because that is how this screen is ever reached:
  from a link in an email. It rides in a hidden input inside the form, so the
  reset posts on a page whose JavaScript never arrived.

  A screen owns the viewport, so its root is `min-h-dvh`: each frame below caps
  its height and scrolls, the way a phone or a laptop crops a page. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  three width tabs disagree with each other on one screen — and why the widest
  one scrolls sideways inside the docs column rather than waiting for a wide
  monitor.
-->
<script lang="ts">
  import ResetPassword from "../../../../registry/screens/reset-password/svelte/ResetPassword.svelte";
  import DemoTabs from "./DemoTabs.svelte";

  /** Mount one state on its own (an Examples preview) instead of the width tabs. */
  type State = "feedback" | "error" | "field-error" | "empty";

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

  /** One frame width in each band of the screen's three container steps. */
  const widths = { phone: "22rem", tablet: "42rem", desktop: "62rem" } as const;
  type Frame = keyof typeof widths;

  const copy = {
    en: {
      label: "Reset-password screen widths",
      frames: { phone: "phone", tablet: "tablet", desktop: "desktop" },
      tabs: [
        { id: "phone", icon: "phone", label: "Phone", caption: "Under --container-sm the masthead, the footer and the notes all stack under the card." },
        { id: "tablet", icon: "tablet", label: "Tablet", caption: "Past --container-md and under --container-lg the masthead and the footer each sit on one row, the notes still under the card." },
        { id: "desktop", icon: "desktop", label: "Desktop", caption: "Past --container-lg the notes stand beside the card, so what this link does is read before the password is chosen; this frame is wider than the docs column, so scroll it sideways." },
      ],
      error: "This link has expired. Ask for a new one from the sign-in page.",
      confirmError: "The two passwords do not match.",
    },
    es: {
      label: "Anchos de la pantalla de restablecer contraseña",
      frames: { phone: "teléfono", tablet: "tableta", desktop: "escritorio" },
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono", caption: "Por debajo de --container-sm la cabecera, el pie y las notas se apilan bajo la tarjeta." },
        { id: "tablet", icon: "tablet", label: "Tableta", caption: "Entre --container-md y --container-lg la cabecera y el pie ocupan una fila cada uno, y las notas siguen bajo la tarjeta." },
        { id: "desktop", icon: "desktop", label: "Escritorio", caption: "Por encima de --container-lg las notas se ponen junto a la tarjeta, así que lo que hace este enlace se lee antes de elegir la contraseña; este marco es más ancho que la columna de la documentación, así que desplázalo en horizontal." },
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
  <div class="screen-scroll">
    <div
      class="demo-viewport screen-frame"
      style="--viewport-width: {widths[frame]}"
      data-label="{widths[frame]} · {copy.frames[frame]}"
    >
      <div class="screen-window">
        {#if id === "feedback"}
          <ResetPassword {token} requirements={halfMet} />
        {:else if id === "error"}
          <ResetPassword {token} disabled error={copy.error} />
        {:else if id === "field-error"}
          <ResetPassword {token} errors={{ confirmPassword: copy.confirmError }} />
        {:else if id === "empty"}
          <ResetPassword {token} notices={[]} />
        {:else}
          <ResetPassword {token} />
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
     `registry/screens/reset-password` changes — this rule is the frame telling
     the screen how big the window is, which is what a real viewport does. */
  .screen-window :global(.moderno-screen-reset-password),
  .screen-window :global(.moderno-screen-reset-password > div) {
    min-block-size: 100%;
  }
</style>
