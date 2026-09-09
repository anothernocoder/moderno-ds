<!--
  The auth flow, live and walkable, plus the readout of what its assembly told
  the page it was doing.

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

  The readout beside the frame is the docs', not the design system's: it is the
  `onstepchange` and `onauthenticated` callbacks, printed as they fire, so what
  the assembly *owns* is visible rather than merely described. A real app puts
  the first into its router and the second into its session.

  A screen owns the viewport, so its root is `min-h-dvh`: each frame below caps
  its height and scrolls, the way a phone or a laptop crops a page. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  two frames disagree with each other on one screen.
-->
<script lang="ts">
  import AuthFlow from "../../../../registry/flows/auth/svelte/AuthFlow.svelte";

  type AuthStep = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "verify";

  /** The flow in order — what the readout walks, and what the assembly sequences. */
  const steps: AuthStep[] = [
    "sign-in",
    "sign-up",
    "forgot-password",
    "reset-password",
    "verify",
  ];

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
</script>

<div class="demo-stages">
  <figure class="demo-stage">
    <div class="demo-frame demo-frame--desktop">
      <AuthFlow {onstepchange} {onauthenticated} />
    </div>
    <figcaption>
      Desktop — past <code>--container-lg</code>, so each screen stands its notes beside its card.
      Walk it: the links move the flow, the submits advance it, and any six digits pass the code
      check because there is no server behind an example. This frame is wider than the docs column;
      scroll it sideways.
    </figcaption>
  </figure>

  <figure class="demo-readout" aria-label="What the assembly reported">
    <ol class="demo-steps">
      {#each steps as name (name)}
        <li class:is-current={step === name} aria-current={step === name ? "step" : undefined}>
          <code>{name}</code>
        </li>
      {/each}
    </ol>
    <ul class="demo-events">
      {#if events.length === 0}
        <li class="demo-events-empty">Nothing yet — move the flow above.</li>
      {:else}
        {#each events as line, index (`${index}-${line}`)}
          <li><code>{line}</code></li>
        {/each}
      {/if}
    </ul>
    <figcaption>
      The two callbacks the assembly hands up: the step it moved to, for your router, and the
      address it finished on, for your session. The flow returns to <code>sign-in</code> after
      <code>onauthenticated</code> because leaving is the app's job, not the flow's.
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--phone">
      <AuthFlow />
    </div>
    <figcaption>
      Phone — under <code>--container-sm</code>: its own copy of the same flow, walkable on its own,
      with every screen stacked. Neither frame reads the window.
    </figcaption>
  </figure>
</div>

<style>
  .demo-stages {
    display: grid;
    gap: var(--spacing-8);
  }
  /* Each frame keeps the width its caption names at every viewport — that is
     the whole claim of ADR-0005 — so a frame wider than the docs prose column
     scrolls inside its own figure rather than pushing the page sideways. */
  .demo-stage {
    display: grid;
    gap: var(--spacing-3);
    margin: 0;
    overflow-x: auto;
  }
  /* A window mock. The heights and widths are the demo's, not the design
     system's — the screens themselves size only from contract slots and their
     own container. */
  .demo-frame {
    block-size: 38rem;
    overflow: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  /* The one thing the docs override on the shipped files, and only here: a
     screen's root is `min-h-dvh`, because a screen is as tall as the window it
     owns. Two copies of the browser window stacked down a docs page would be
     unreadable, so inside these frames "the window" is the frame. Nothing in
     `registry/` changes — this rule is the frame telling the screen how big the
     window is, which is what a real viewport does. The flow's own wrapper is in
     the chain now, so it has to carry the height through. */
  .demo-frame :global(.moderno-flow-auth) {
    block-size: 100%;
  }
  .demo-frame :global(.moderno-flow-auth > div),
  .demo-frame :global(.moderno-flow-auth > div > div) {
    min-block-size: 100%;
  }
  .demo-frame--phone {
    inline-size: 22rem;
  }
  .demo-frame--desktop {
    inline-size: 62rem;
  }
  .demo-readout {
    display: grid;
    gap: var(--spacing-3);
    margin: 0;
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
  figcaption {
    color: var(--muted-foreground);
    font-size: 0.875em;
  }
</style>
