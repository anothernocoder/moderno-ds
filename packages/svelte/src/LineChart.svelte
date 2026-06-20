<!--
  LineChart — pure map from `buildLineChart`'s model to <svg>, ported to Svelte 5.
  One <path data-part="line"> per series; geometry comes entirely from
  charts-core. No baked colour/style — see ChartFrame.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { buildLineChart, type LineChartOptions } from "@moderno/charts-core";
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
  }: LineChartOptions & SvgProps = $props();

  const model = $derived(buildLineChart({
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

<ChartFrame type="line" {model} {...rest}>
  {#each model.series as s (s.index)}
    <g data-part="series" data-series={s.index}>
      <path data-part="line" d={s.path} />
    </g>
  {/each}
</ChartFrame>
