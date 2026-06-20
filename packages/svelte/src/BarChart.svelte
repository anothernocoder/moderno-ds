<!--
  BarChart — pure map from `buildBarChart`'s model to <svg>, ported to Svelte 5.
  One <rect data-part="bar"> per category per series.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { buildBarChart, type BarChartOptions } from "@moderno/charts-core";
  import ChartFrame from "./ChartFrame.svelte";

  type SvgProps = Omit<
    SVGAttributes<SVGSVGElement>,
    "width" | "height" | "format" | "radius" | "type"
  >;

  let {
    width,
    height,
    margin,
    categories,
    series,
    yDomain,
    yTicks,
    padding,
    format,
    ...rest
  }: BarChartOptions & SvgProps = $props();

  const model = $derived(buildBarChart({
    width,
    height,
    margin,
    categories,
    series,
    yDomain,
    yTicks,
    padding,
    format,
  }));
</script>

<ChartFrame type="bar" {model} {...rest}>
  {#each model.series as s (s.index)}
    <g data-part="series" data-series={s.index}>
      {#each s.bars as b (b.category)}
        <rect data-part="bar" x={b.x} y={b.y} width={b.width} height={b.height} />
      {/each}
    </g>
  {/each}
</ChartFrame>
