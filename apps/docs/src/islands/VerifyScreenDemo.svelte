<!--
  The verify screen, mounted seven times: three container widths — one in each
  band of its three steps — then the four states that change what is on screen
  rather than how it is laid out.

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
  three stages disagree with each other on one screen — and why the widest one
  scrolls sideways inside the docs column rather than waiting for a wide monitor.
-->
<script lang="ts">
  import Verify from "../../../../registry/screens/verify/svelte/Verify.svelte";

  /** The address the code went to; a real page reads it off the session. */
  const sentTo = "ada@example.com";
</script>

<div class="demo-stages">
  <figure class="demo-stage">
    <div class="demo-frame demo-frame--phone"><Verify {sentTo} /></div>
    <figcaption>
      Phone — under <code>--container-sm</code>: masthead, footer and the notes all stack under the
      card
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><Verify {sentTo} /></div>
    <figcaption>
      Tablet — past <code>--container-md</code>, under <code>--container-lg</code>: the masthead and
      the footer are each on one row, the notes still under the card
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--desktop"><Verify {sentTo} /></div>
    <figcaption>
      Desktop — past <code>--container-lg</code>: the notes stand beside the card, so "look in spam"
      is read while the inbox is still open. This frame is wider than the docs column; scroll it
      sideways.
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <Verify {sentTo} errors={{ code: "That code is not right. Check the newest email and try again." }} />
    </div>
    <figcaption>
      Field error — the code was wrong: every cell goes invalid and the reason is printed under them
      as an alert, so it is announced when it arrives
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><Verify {sentTo} resendIn={42} /></div>
    <figcaption>
      Resend locked — a code has just gone out, so the second button counts down instead of pretending
      it can send another one
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <Verify
        {sentTo}
        disabled
        error="Too many attempts. Wait ten minutes, then ask for a new code."
      />
    </div>
    <figcaption>
      Error — the attempts are spent, which is a failure of the account and not of the code that was
      typed: the alert says so and <code>disabled</code> stops the form pretending it can still take one
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><Verify {sentTo} notices={[]} /></div>
    <figcaption>
      Empty — with nothing to say about the code, the aside is not rendered at all and the card sits
      centred and alone
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
     `registry/screens/verify` changes — this rule is the frame telling the
     screen how big the window is, which is what a real viewport does. */
  .demo-frame :global(.moderno-screen-verify),
  .demo-frame :global(.moderno-screen-verify > div) {
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
