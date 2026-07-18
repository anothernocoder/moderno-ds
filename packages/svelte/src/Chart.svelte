<!--
  Chart — the Svelte walker over charts-core's render tree. The complete render
  description (geometry, label anchors, data-part structure) is computed in
  @moderno/charts-core; this component only maps nodes onto elements. The tag
  set is closed, so each branch renders statically inside the <svg> namespace
  (no <svelte:element> namespace guessing). No baked colour/style — series
  paint from `--chart-*` via the data-series index in components.css. Parity
  with the core's reference serialization is tested (F4.4).
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import type { ChartNode } from "@moderno/charts-core";

  // `width`/`height` are numeric chart dimensions and `format` is the chart's
  // tick formatter — all collide with native SVG attributes, so drop them.
  // `type` is the chart discriminator prop and likewise shadows SVG's `type`.
  type SvgProps = Omit<
    SVGAttributes<SVGSVGElement>,
    "width" | "height" | "format" | "radius" | "type"
  >;

  let { node, ...rest }: { node: ChartNode } & SvgProps = $props();
</script>

{#snippet nodes(list: ChartNode[])}
  {#each list as n, i (i)}
    {#if n.tag === "g"}<g {...n.attrs}>{@render nodes(n.children ?? [])}</g>{:else if n.tag === "text"}<text {...n.attrs}>{n.text}</text>{:else if n.tag === "line"}<line {...n.attrs} />{:else if n.tag === "path"}<path {...n.attrs} />{:else if n.tag === "rect"}<rect {...n.attrs} />{:else if n.tag === "circle"}<circle {...n.attrs} />{/if}
  {/each}
{/snippet}

<!-- Consumer attrs spread first; the contract attrs land last and can't be clobbered. -->
<svg {...rest} {...node.attrs}>{@render nodes(node.children ?? [])}</svg>
