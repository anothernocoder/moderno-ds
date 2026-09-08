<!--
  The same Pricing block, mounted twice at two container widths.

  This is the registry source itself (registry/blocks/pricing/svelte), not a
  copy — the point of the demo is that one block, unchanged, lays itself out
  from the width of whatever it was put inside (ADR-0005). The first figure is
  capped at `max-w-sm` (--container-sm, 24rem), below the block's `@md` step, so
  it stacks; the second takes the panel's full width and goes three-up as soon
  as that panel is at least --container-md (36rem) wide. Narrow the browser and
  the second stacks too, on its own, with no viewport query anywhere.

  The figures sit one above the other on purpose: side by side, the wide one
  would only ever get half the panel — below the step it exists to cross.
-->
<script lang="ts">
  import Pricing from "../../../../registry/blocks/pricing/svelte/Pricing.svelte";
</script>

<div class="demo-containers">
  <figure class="demo-container">
    <div class="max-w-sm">
      <Pricing />
    </div>
    <figcaption>Narrow container — 24rem (<code>--container-sm</code>)</figcaption>
  </figure>

  <figure class="demo-container">
    <Pricing />
    <figcaption>Wide container — the panel's full width</figcaption>
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
  figcaption {
    color: var(--muted-foreground);
    font-size: 0.875em;
  }
</style>
