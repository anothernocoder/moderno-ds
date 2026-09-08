<!--
  The login-form block, mounted five times: twice at different container widths
  and three times in the states a sign-in section actually has.

  This is the registry source itself (registry/blocks/login-form/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add login-form-svelte`
  writes into a consumer project, so the demo cannot drift from the file the
  docs print underneath it.

  The first figure is a sidebar narrower than `--container-sm` (24rem), which is
  the only thing that makes the block's `@sm` step visible on a wide screen: the
  remember-me row and the recovery link stack there and sit on one line
  everywhere above it. Narrow the browser and the second figure crosses the same
  step on its own, with no viewport query anywhere (ADR-0005).
-->
<script lang="ts">
  import LoginForm from "../../../../registry/blocks/login-form/svelte/LoginForm.svelte";
</script>

<div class="demo-containers">
  <figure class="demo-container">
    <div class="demo-sidebar">
      <LoginForm />
    </div>
    <figcaption>
      Narrow container — a sidebar under <code>--container-sm</code>: the secondary row stacks
    </figcaption>
  </figure>

  <figure class="demo-container">
    <LoginForm />
    <figcaption>
      Wide container — the card centres and caps itself at <code>--container-sm</code>
    </figcaption>
  </figure>

  <figure class="demo-container">
    <LoginForm error="Those credentials did not match. Check them and try again." />
    <figcaption>
      Error — one form-level alert, both credential fields invalid, and no hint about which one
      failed
    </figcaption>
  </figure>

  <figure class="demo-container">
    <LoginForm loading />
    <figcaption>Loading — every control inert, the submit marked <code>aria-busy</code></figcaption>
  </figure>

  <figure class="demo-container">
    <LoginForm disabled />
    <figcaption>Disabled — sign-in is unavailable (an SSO-only workspace, a locked account)</figcaption>
  </figure>
</div>

<style>
  .demo-containers {
    display: grid;
    gap: var(--spacing-8);
  }
  .demo-container {
    display: grid;
    gap: var(--spacing-3);
    margin: 0;
  }
  /* A sidebar mock, deliberately below the block's first container step so the
     stacked secondary row is on screen next to the one-line version. The width
     is the demo's, not the design system's — the block itself sizes only from
     contract slots. */
  .demo-sidebar {
    width: 18rem;
    max-width: 100%;
  }
  figcaption {
    color: var(--muted-foreground);
    font-size: 0.875em;
  }
</style>
