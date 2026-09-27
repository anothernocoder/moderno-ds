<!--
  The same Pricing block at two container widths, one tab each.

  This is the registry source itself (registry/blocks/pricing/svelte), not a
  copy — the point of the demo is that one block, unchanged, lays itself out
  from the width of whatever it was put inside (ADR-0005). The narrow tab frames
  it at 24rem (--container-sm), below the block's `@md` step, so it stacks; the
  wide tab gives it the stage's full width, and it goes three-up as soon as
  that stage is at least --container-md (36rem) wide. Narrow the browser and the
  wide tab stacks too, on its own, with no viewport query anywhere.

  The narrow tab is framed with its width on its border, so the cap reads as
  the point of the tab rather than as a layout accident. The wide tab is not
  framed: its width is the stage's own, which is what has to track the window —
  a frame's padding would also cost it the 36rem step on a mid-sized screen.
-->
<script lang="ts">
  import Pricing from "../../../../registry/blocks/pricing/svelte/Pricing.svelte";
  import DemoTabs from "./DemoTabs.svelte";

  let { locale = "en" }: { locale?: "en" | "es" } = $props();

  const copy = {
    en: {
      label: "Pricing container widths",
      tabs: [
        { id: "narrow", label: "Narrow", caption: "Capped at 24rem (--container-sm), under the block's @md step, so the plans stack." },
        { id: "wide", label: "Wide", caption: "The stage's full width: three-up once it is at least 36rem (--container-md) — narrow the window and it stacks on its own." },
      ],
    },
    es: {
      label: "Anchos de contenedor de Pricing",
      tabs: [
        { id: "narrow", label: "Estrecho", caption: "Limitado a 24rem (--container-sm), por debajo del paso @md del bloque, así que los planes se apilan." },
        { id: "wide", label: "Ancho", caption: "Todo el ancho del escenario: tres columnas en cuanto mide al menos 36rem (--container-md) — estrecha la ventana y se apila por su cuenta." },
      ],
    },
  }[locale];
</script>

<DemoTabs tabs={copy.tabs} label={copy.label}>
  {#snippet stage(id)}
    {#if id === "wide"}
      <Pricing />
    {:else}
      <div class="demo-viewport" style="--viewport-width: 24rem" data-label="24rem">
        <Pricing />
      </div>
    {/if}
  {/snippet}
</DemoTabs>
