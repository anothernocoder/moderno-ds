<!--
  AreaChart — pure map from `buildAreaChart`'s model to <svg>, ported to Svelte 5.
  Per series: a filled <path data-part="area"> then its top <path data-part="line">.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { buildAreaChart, type AreaChartOptions } from "@moderno/charts-core";
  import ChartFrame from "./ChartFrame.svelte";

  type SvgProps = Omit<
    SVGAttributes<SVGSVGElement>,
    "width" | "height" | "format" | "radius" | "type"
  >;

  let {
    width,
    height,
    margin,
    series,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    format,
    curve,
    ...rest
  }: AreaChartOptions & SvgProps = $props();

  const model = $derived(buildAreaChart({
    width,
    height,
    margin,
    series,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    format,
    curve,
  }));
</script>

<ChartFrame type="area" {model} {...rest}>
  {#each model.series as s (s.index)}
    <g data-part="series" data-series={s.index}>
      <path data-part="area" d={s.area} />
      <path data-part="line" d={s.line} />
    </g>
  {/each}
</ChartFrame>
