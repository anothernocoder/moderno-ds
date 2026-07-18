<!--
  LineChart — builds the render tree with `lineChartNodes` and hands it to the
  Chart walker. Geometry, label anchors and data-part structure all come from
  charts-core; this file holds none of it.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { lineChartNodes, type LineChartOptions } from "@moderno/charts-core";
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
    curve,
    ...rest
  }: LineChartOptions & SvgProps = $props();

  const node = $derived(
    lineChartNodes({
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
    }),
  );
</script>

<Chart {node} {...rest} />
