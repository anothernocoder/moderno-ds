<!--
  The login-form block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/login-form/svelte), not a
  copy — what renders below is byte-for-byte what `moderno add login-form-svelte`
  writes into a consumer project, so the demo cannot drift from the file the
  docs print underneath it.

  The narrow state is a sidebar below `--container-sm` (24rem), which is the only
  thing that makes the block's `@sm` step visible on a wide screen. It is framed
  and labelled so the width reads as the point of the example (ADR-0005).

  `data-demo-state` names the state on the wrapper, so the e2e spec can find
  each copy by what it is meant to show.
-->
<script lang="ts">
  import LoginForm from "../../../../registry/blocks/login-form/svelte/LoginForm.svelte";

  type State = "default" | "narrow" | "error" | "loading" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const error = {
    en: "Those credentials did not match. Check them and try again.",
    es: "Esas credenciales no coinciden. Revísalas e inténtalo de nuevo.",
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "narrow"}
    <div class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
      <LoginForm />
    </div>
  {:else if state === "error"}
    <LoginForm {error} />
  {:else if state === "loading"}
    <LoginForm loading />
  {:else if state === "disabled"}
    <LoginForm disabled />
  {:else}
    <LoginForm />
  {/if}
</div>
