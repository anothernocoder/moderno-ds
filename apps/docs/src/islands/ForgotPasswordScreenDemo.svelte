<!--
  The forgot-password screen, mounted seven times: three container widths — one
  in each band of its three steps — then the sent-confirmation state, and then
  the three states that change what is on screen rather than how it is laid out.

  This is the registry source itself (registry/screens/forgot-password/svelte),
  not a copy — what renders below is byte-for-byte what `moderno add
  forgot-password-svelte` writes into a consumer project, and the card and the
  notes inside it are the registry login-form (in its forgot-password mode) and
  alert-list the CLI installs alongside it (astro.config.mjs resolves the
  screen's `@/components/blocks/…` imports back to them), so nothing here can
  drift from what ships.

  A screen owns the viewport, so its root is `min-h-dvh`: each frame below caps
  its height and scrolls, the way a phone or a laptop crops a page. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  three stages disagree with each other on one screen — and why the widest one
  scrolls sideways inside the docs column rather than waiting for a wide monitor.
-->
<script lang="ts">
  import ForgotPassword from "../../../../registry/screens/forgot-password/svelte/ForgotPassword.svelte";
</script>

<div class="demo-stages">
  <figure class="demo-stage">
    <div class="demo-frame demo-frame--phone"><ForgotPassword /></div>
    <figcaption>
      Phone — under <code>--container-sm</code>: masthead, footer and the notes all stack under the
      card
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><ForgotPassword /></div>
    <figcaption>
      Tablet — past <code>--container-md</code>, under <code>--container-lg</code>: the masthead and
      the footer are each on one row, the notes still under the card
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--desktop"><ForgotPassword /></div>
    <figcaption>
      Desktop — past <code>--container-lg</code>: the notes stand beside the card. This frame is
      wider than the docs column; scroll it sideways.
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <ForgotPassword sent sentTo="ada@example.com" />
    </div>
    <figcaption>
      Sent — the same card, confirming: nothing around it moved, and the sentence says "if that
      address has an account", never whether it does
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <ForgotPassword error="We could not send the link. Try again in a moment." />
    </div>
    <figcaption>
      Error — the form-level alert: nothing about the address was wrong, the mail could not be sent
      at all
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <ForgotPassword errors={{ email: "That does not look like an email address." }} />
    </div>
    <figcaption>
      Field error — a malformed address may be named, because saying so leaks nothing; whether the
      address has an account is never told
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><ForgotPassword notices={[]} /></div>
    <figcaption>
      Empty — with nothing to warn about, the aside is not rendered at all and the card sits centred
      and alone
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
     system's — the screen itself sizes only from contract slots and its own
     container. */
  .demo-frame {
    block-size: 38rem;
    overflow: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  /* The one thing the docs override on the shipped file, and only here: the
     screen's root is `min-h-dvh`, because a screen is as tall as the window it
     owns. Seven copies of the browser window stacked down a docs page would be
     unreadable, so inside these frames "the window" is the frame. Nothing in
     `registry/screens/forgot-password` changes — this rule is the frame telling
     the screen how big the window is, which is what a real viewport does. */
  .demo-frame :global(.moderno-screen-forgot-password),
  .demo-frame :global(.moderno-screen-forgot-password > div) {
    min-block-size: 100%;
  }
  .demo-frame--phone {
    inline-size: 22rem;
  }
  .demo-frame--tablet {
    inline-size: 42rem;
  }
  .demo-frame--desktop {
    inline-size: 62rem;
  }
  figcaption {
    color: var(--muted-foreground);
    font-size: 0.875em;
  }
</style>
