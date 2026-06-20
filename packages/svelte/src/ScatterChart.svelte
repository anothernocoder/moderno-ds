<!--
  ScatterChart — pure map from `buildScatterChart`'s model to <svg>, ported to
  Svelte 5. One <circle data-part="point"> per point.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { buildScatterChart, type ScatterChartOptions } from "@moderno/charts-core";
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
    radius,
    ...rest
  }: ScatterChartOptions & SvgProps = $props();

  const model = $derived(buildScatterChart({
    width,
    height,
    margin,
    series,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    format,
    radius,
  }));
</script>

<ChartFrame type="scatter" {model} {...rest}>
  {#each model.series as s (s.index)}
    <g data-part="series" data-series={s.index}>
      {#each s.points as p, i (i)}
        <circle data-part="point" cx={p.cx} cy={p.cy} r={p.r} />
      {/each}
    </g>
  {/each}
</ChartFrame>
