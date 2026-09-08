<!--
  The sign-in screen, mounted seven times: three container widths — one in each
  band of its three steps — and then the four states that change what is on
  screen rather than how it is laid out.

  This is the registry source itself (registry/screens/sign-in/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add sign-in-svelte`
  writes into a consumer project, and the two blocks inside it are the registry
  blocks the CLI installs alongside it (astro.config.mjs resolves the screen's
  `@/components/blocks/…` imports back to them), so nothing here can drift from
  what ships.

  A screen owns the viewport, so its root is `min-h-dvh`: each frame below caps
  its height and scrolls, the way a phone or a laptop crops a page. Every width
  decision is read off the screen's own container (ADR-0005), which is why the
  three stages disagree with each other on one screen — and why the widest one
  scrolls sideways inside the docs column rather than waiting for a wide monitor.
-->
<script lang="ts">
  import SignIn from "../../../../registry/screens/sign-in/svelte/SignIn.svelte";
</script>

<div class="demo-stages">
  <figure class="demo-stage">
    <div class="demo-frame demo-frame--phone"><SignIn /></div>
    <figcaption>
      Phone — under <code>--container-sm</code>: masthead, footer and notices all stack under the
      card
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><SignIn /></div>
    <figcaption>
      Tablet — past <code>--container-md</code>, under <code>--container-lg</code>: the masthead and
      the footer are each on one row, the notices still under the card
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--desktop"><SignIn /></div>
    <figcaption>
      Desktop — past <code>--container-lg</code>: the notices stand beside the card. This frame is
      wider than the docs column; scroll it sideways.
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <SignIn error="Those credentials did not match. Check them and try again." />
    </div>
    <figcaption>
      Error — one form-level alert, both credential fields invalid, and no hint about which one
      failed
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><SignIn loading noticesLoading /></div>
    <figcaption>
      Loading — the form inert with its submit marked <code>aria-busy</code>, and a busy region
      standing in for the notices
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <SignIn noticesError="We could not load the service notices." />
    </div>
    <figcaption>
      Notices error — the list is replaced by one alert with a retry, because "no notices" and "we
      could not check" are different facts
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><SignIn notices={[]} /></div>
    <figcaption>
      Empty — nothing is wrong today, so the aside is not rendered at all and the card sits centred
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
     `registry/screens/sign-in` changes — this rule is the frame telling the
     screen how big the window is, which is exactly what a real viewport does. */
  .demo-frame :global(.moderno-screen-sign-in),
  .demo-frame :global(.moderno-screen-sign-in > div) {
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
