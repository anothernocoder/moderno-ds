<!--
  BarChart — builds the render tree with `barChartNodes` and hands it to the
  Chart walker. Geometry, label anchors and data-part structure all come from
  charts-core; this file holds none of it.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { barChartNodes, type BarChartOptions } from "@moderno/charts-core";
  import Chart from "./Chart.svelte";

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

  const node = $derived(
    barChartNodes({
      width,
      height,
      margin,
      categories,
      series,
      yDomain,
      yTicks,
      padding,
      format,
    }),
  );
</script>

<Chart {node} {...rest} />
