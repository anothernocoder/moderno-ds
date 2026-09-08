<!--
  Live block previews — the registry sources themselves
  (`registry/blocks/*/svelte`), imported straight from the repo rather than
  copied here. What renders below is byte-for-byte what `moderno add` writes
  into a consumer project, so a block that drifts from its docs is impossible.

  Blocks compose primitives and carry no styling of their own beyond a
  `moderno-block-*` class. Those classes have no rules on `main` yet — block
  layout arrives with the container-query pipeline in ADR-0005 — so what you see
  is the composition and the primitives' own painting, not the finished section.
  That gap is deliberately on screen instead of hidden behind a mockup.
-->
<script lang="ts">
  import LoginForm from "../../../../registry/blocks/login-form/svelte/LoginForm.svelte";
  import FormLayout from "../../../../registry/blocks/form-layout/svelte/FormLayout.svelte";
  import Pricing from "../../../../registry/blocks/pricing/svelte/Pricing.svelte";
  import EmptyState from "../../../../registry/blocks/empty-state/svelte/EmptyState.svelte";

  let { block }: { block: "login-form" | "form-layout" | "pricing" | "empty-state" } = $props();
</script>

<div class="demo-block">
  {#if block === "login-form"}
    <LoginForm />
  {:else if block === "form-layout"}
    <FormLayout />
  {:else if block === "pricing"}
    <Pricing />
  {:else}
    <EmptyState />
  {/if}
</div>

<style>
  /* The panel is the block's container, which is the point: a block sizes
     itself from whatever it was mounted in, never from the viewport (ADR-0005). */
  .demo-block {
    container-type: inline-size;
  }
</style>
