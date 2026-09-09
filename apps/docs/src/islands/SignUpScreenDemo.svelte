<!--
  The sign-up screen, mounted seven times: three container widths — one in each
  band of its three steps — and then the four states that change what is on
  screen rather than how it is laid out.

  This is the registry source itself (registry/screens/sign-up/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add sign-up-svelte`
  writes into a consumer project, and the card inside it is the registry
  login-form the CLI installs alongside it, in its sign-up mode
  (astro.config.mjs resolves the screen's `@/components/blocks/…` import back to
  it), so nothing here can drift from what ships.

  A screen owns the viewport, so its root is `min-h-dvh`: each frame below caps
  its height and scrolls, the way a phone or a laptop crops a page. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  three stages disagree with each other on one screen — and why the widest one
  scrolls sideways inside the docs column rather than waiting for a wide monitor.
-->
<script lang="ts">
  import SignUp from "../../../../registry/screens/sign-up/svelte/SignUp.svelte";
</script>

<div class="demo-stages">
  <figure class="demo-stage">
    <div class="demo-frame demo-frame--phone"><SignUp /></div>
    <figcaption>
      Phone — under <code>--container-sm</code>: masthead, footer and the highlights all stack under
      the card
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><SignUp /></div>
    <figcaption>
      Tablet — past <code>--container-md</code>, under <code>--container-lg</code>: the masthead and
      the footer are each on one row, the highlights still under the card
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--desktop"><SignUp /></div>
    <figcaption>
      Desktop — past <code>--container-lg</code>: the highlights stand beside the card. This frame is
      wider than the docs column; scroll it sideways.
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <SignUp error="We could not create the account. Try again in a moment." />
    </div>
    <figcaption>
      Error — the form-level alert: nothing about the form was wrong, the account could not be
      created at all
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <SignUp
        errors={{
          email: "That address already has an account.",
          password: "Twelve characters or more, please.",
        }}
      />
    </div>
    <figcaption>
      Field errors — a sign-up may name the field it rejected; a sign-in may not, because saying
      which credential failed confirms the address exists
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><SignUp loading /></div>
    <figcaption>
      Loading — every control inert and the submit marked <code>aria-busy</code>, so a second account
      cannot be fired off mid-request
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><SignUp highlights={[]} /></div>
    <figcaption>
      Empty — an invite-only or internal sign-up has nothing to sell, so the aside is not rendered at
      all and the card sits centred and alone
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
     `registry/screens/sign-up` changes — this rule is the frame telling the
     screen how big the window is, which is exactly what a real viewport does. */
  .demo-frame :global(.moderno-screen-sign-up),
  .demo-frame :global(.moderno-screen-sign-up > div) {
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
