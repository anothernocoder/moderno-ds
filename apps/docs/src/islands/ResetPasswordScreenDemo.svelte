<!--
  The reset-password screen, mounted seven times: three container widths — one
  in each band of its three steps — then the rules half met, and then the three
  states that change what is on screen rather than how it is laid out.

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
  three stages disagree with each other on one screen — and why the widest one
  scrolls sideways inside the docs column rather than waiting for a wide monitor.
-->
<script lang="ts">
  import ResetPassword from "../../../../registry/screens/reset-password/svelte/ResetPassword.svelte";

  /** Stands in for the token a real link carries in its query string. */
  const token = "8f14e45fceea167a5a36dedd4bea2543";

  /** The rules as they read once a long-enough password with mixed case is typed. */
  const halfMet = [
    { id: "length", label: "At least 12 characters", met: true },
    { id: "case", label: "An upper and a lower case letter", met: true },
    { id: "symbol", label: "A number or a symbol" },
  ];
</script>

<div class="demo-stages">
  <figure class="demo-stage">
    <div class="demo-frame demo-frame--phone"><ResetPassword {token} /></div>
    <figcaption>
      Phone — under <code>--container-sm</code>: masthead, footer and the notes all stack under the
      card
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><ResetPassword {token} /></div>
    <figcaption>
      Tablet — past <code>--container-md</code>, under <code>--container-lg</code>: the masthead and
      the footer are each on one row, the notes still under the card
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--desktop"><ResetPassword {token} /></div>
    <figcaption>
      Desktop — past <code>--container-lg</code>: the notes stand beside the card, so what this link
      does is read before the password is chosen. This frame is wider than the docs column; scroll it
      sideways.
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <ResetPassword {token} requirements={halfMet} />
    </div>
    <figcaption>
      Validation feedback — two rules met, one still open. The list is the field's own helper text,
      so it is read on focus, and each line that flips is announced on its own
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <ResetPassword
        {token}
        disabled
        error="This link has expired. Ask for a new one from the sign-in page."
      />
    </div>
    <figcaption>
      Error — the spent link, which is a failure of the token and not of any field: the alert says so
      and <code>disabled</code> stops the form pretending it can still take a password
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet">
      <ResetPassword {token} errors={{ confirmPassword: "The two passwords do not match." }} />
    </div>
    <figcaption>
      Field error — the confirmation disagrees with the password; that field alone goes invalid and
      prints its own message
    </figcaption>
  </figure>

  <figure class="demo-stage">
    <div class="demo-frame demo-frame--tablet"><ResetPassword {token} notices={[]} /></div>
    <figcaption>
      Empty — with nothing to say about the link, the aside is not rendered at all and the card sits
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
     `registry/screens/reset-password` changes — this rule is the frame telling
     the screen how big the window is, which is what a real viewport does. */
  .demo-frame :global(.moderno-screen-reset-password),
  .demo-frame :global(.moderno-screen-reset-password > div) {
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
