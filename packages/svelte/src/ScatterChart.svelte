<!--
  ScatterChart — builds the render tree with `scatterChartNodes` and hands it
  to the Chart walker. Geometry, label anchors and data-part structure all come
  from charts-core; this file holds none of it.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { scatterChartNodes, type ScatterChartOptions } from "@moderno/charts-core";
  import Chart from "./Chart.svelte";

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

  const node = $derived(
    scatterChartNodes({
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
    }),
  );
</script>

<Chart {node} {...rest} />
