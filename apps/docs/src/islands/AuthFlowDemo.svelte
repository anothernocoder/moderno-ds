<!--
  The auth flow, live and walkable, plus the readout of what its assembly told
  the page it was doing — one frame width per tab, desktop first. Only the
  active tab's copy is mounted (DemoTabs), so switching tabs starts a fresh walk
  at `sign-in` and the readout starts over with it.

  This is the registry source itself (registry/flows/auth/svelte), not a copy —
  what renders below is byte-for-byte what `moderno add auth-svelte` writes into
  a consumer project, and the five screens inside it are the registry screens
  the CLI installs alongside it (astro.config.mjs resolves the assembly's
  `@/components/screens/…` imports back to them, the same way it already
  resolves a screen's `@/components/blocks/…`), so nothing here can drift from
  what ships.

  The walk the reader can take, with nothing faked but the mail:

    sign-in →[Create an account]→ sign-up →[submit]→ verify
            →[any six digits]→ signed in, back to sign-in
    sign-in →[Forgot your password?]→ forgot-password →[submit]→
            the confirmation →[Open the reset link]→ reset-password
            →[a password, twice]→ signed in, back to sign-in

  Every move between two screens is a plain link the card or the masthead draws;
  the assembly catches the click the way a client router does. Nothing on this
  page is a button wired to a step — that is the point being demonstrated.

  The readout under the frame is the docs', not the design system's: it is the
  `onstepchange` and `onauthenticated` callbacks, printed as they fire, so what
  the assembly *owns* is visible rather than merely described. A real app puts
  the first into its router and the second into its session.

  A screen owns the viewport, so its root is `min-h-dvh`: each frame caps its
  height and scrolls, the way a phone or a laptop crops a page. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  two tabs disagree with each other on one screen.
-->
<script lang="ts">
  import AuthFlow from "../../../../registry/flows/auth/svelte/AuthFlow.svelte";
  import DemoTabs from "./DemoTabs.svelte";

  type AuthStep = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "verify";

  let { locale = "en" }: { locale?: "en" | "es" } = $props();

  /** The flow in order — what the readout walks, and what the assembly sequences. */
  const steps: AuthStep[] = [
    "sign-in",
    "sign-up",
    "forgot-password",
    "reset-password",
    "verify",
  ];

  /** One frame below the screens' first step, one past their last. */
  const widths = { desktop: "62rem", phone: "22rem" } as const;
  type Frame = keyof typeof widths;

  const copy = {
    en: {
      label: "Auth flow frames",
      frames: { desktop: "desktop", phone: "phone" },
      tabs: [
        { id: "desktop", icon: "desktop", label: "Desktop", caption: "Past --container-lg every screen stands its notes beside its card — walk it: the links move the flow, the submits advance it, and any six digits pass the code check, because there is no server behind an example." },
        { id: "phone", icon: "phone", label: "Phone", caption: "Under --container-sm the same flow, walkable on its own, with every screen stacked; neither frame reads the window." },
      ],
      readout: "What the assembly reported",
      empty: "Nothing yet — move the flow above.",
      note: "The two callbacks the assembly hands up: the step it moved to, for your router, and the address it finished on, for your session. The flow returns to sign-in after onauthenticated because leaving is the app's job, not the flow's.",
    },
    es: {
      label: "Marcos del flujo de acceso",
      frames: { desktop: "escritorio", phone: "teléfono" },
      tabs: [
        { id: "desktop", icon: "desktop", label: "Escritorio", caption: "Por encima de --container-lg cada pantalla pone sus notas junto a la tarjeta — recórrelo: los enlaces mueven el flujo, los envíos lo hacen avanzar y seis dígitos cualesquiera pasan la comprobación del código, porque detrás de un ejemplo no hay servidor." },
        { id: "phone", icon: "phone", label: "Teléfono", caption: "Por debajo de --container-sm el mismo flujo, recorrible por sí solo, con cada pantalla apilada; ningún marco lee la ventana." },
      ],
      readout: "Lo que informó el ensamblaje",
      empty: "Nada todavía — mueve el flujo de arriba.",
      note: "Los dos callbacks que el ensamblaje devuelve: el paso al que se movió, para tu router, y la dirección con la que terminó, para tu sesión. El flujo vuelve a sign-in después de onauthenticated porque salir es trabajo de la aplicación, no del flujo.",
    },
  }[locale];

  let step = $state<AuthStep>("sign-in");
  let events = $state<string[]>([]);

  function record(line: string) {
    events = [line, ...events].slice(0, 6);
  }

  function onstepchange(next: AuthStep) {
    step = next;
    record(`onstepchange("${next}")`);
  }

  function onauthenticated(email: string) {
    record(`onauthenticated("${email || "—"}")`);
  }

  function frameOf(id: string): Frame {
    return id === "phone" ? "phone" : "desktop";
  }

  /** A tab mounts a fresh flow at its first step, so the readout starts over too. */
  function fresh() {
    step = "sign-in";
    events = [];
  }
</script>

<DemoTabs tabs={copy.tabs} label={copy.label}>
  {#snippet stage(id)}
    {@const frame = frameOf(id)}
    <div class="auth-stage" {@attach fresh}>
      <div class="screen-scroll">
        <div
          class="demo-viewport screen-frame"
          style="--viewport-width: {widths[frame]}"
          data-label="{widths[frame]} · {copy.frames[frame]}"
        >
          <div class="screen-window">
            <AuthFlow {onstepchange} {onauthenticated} />
          </div>
        </div>
      </div>

      <div class="demo-readout" role="group" aria-label={copy.readout}>
        <ol class="demo-steps">
          {#each steps as name (name)}
            <li class:is-current={step === name} aria-current={step === name ? "step" : undefined}>
              <code>{name}</code>
            </li>
          {/each}
        </ol>
        <ul class="demo-events">
          {#if events.length === 0}
            <li class="demo-events-empty">{copy.empty}</li>
          {:else}
            {#each events as line, index (`${index}-${line}`)}
              <li><code>{line}</code></li>
            {/each}
          {/if}
        </ul>
        <p class="demo-readout-note">{copy.note}</p>
      </div>
    </div>
  {/snippet}
</DemoTabs>

<style>
  .auth-stage {
    display: grid;
    gap: var(--spacing-6);
  }
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
     and no `min(100%, …)` cap, because the screens read their container and a
     capped frame would quietly move them into another band. */
  .screen-frame {
    width: calc(var(--viewport-width) + 2px);
    padding: 0;
  }
  /* The window the flow owns. The height is the demo's, not the design
     system's — the screens themselves size only from contract slots and their
     own container. */
  .screen-window {
    block-size: 38rem;
    overflow: auto;
    border-radius: inherit;
  }
  /* The one thing the docs override on the shipped files, and only here: a
     screen's root is `min-h-dvh`, because a screen is as tall as the window it
     owns. A browser window's worth of flow inside a docs page would bury the
     prose, so inside this frame "the window" is the frame. Nothing in
     `registry/` changes — this rule is the frame telling the screen how big the
     window is, which is what a real viewport does. The flow's own wrapper is in
     the chain, so it has to carry the height through. */
  .screen-window :global(.moderno-flow-auth) {
    block-size: 100%;
  }
  .screen-window :global(.moderno-flow-auth > div),
  .screen-window :global(.moderno-flow-auth > div > div) {
    min-block-size: 100%;
  }
  .demo-readout {
    display: grid;
    gap: var(--spacing-3);
    max-inline-size: 62rem;
    margin-inline: auto;
    inline-size: 100%;
  }
  .demo-steps {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .demo-steps li {
    padding: var(--spacing-1) var(--spacing-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--muted-foreground);
  }
  .demo-steps li.is-current {
    border-color: var(--primary);
    color: var(--foreground);
  }
  .demo-events {
    display: grid;
    gap: var(--spacing-1);
    margin: 0;
    padding: 0;
    list-style: none;
    min-block-size: 6rem;
    align-content: start;
  }
  .demo-events-empty {
    color: var(--muted-foreground);
  }
  .demo-readout-note {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.5;
  }
</style>
