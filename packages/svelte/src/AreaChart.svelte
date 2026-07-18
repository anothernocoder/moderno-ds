<!--
  AreaChart — builds the render tree with `areaChartNodes` and hands it to the
  Chart walker. Geometry, label anchors and data-part structure all come from
  charts-core; this file holds none of it.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { areaChartNodes, type AreaChartOptions } from "@moderno/charts-core";
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
  }: AreaChartOptions & SvgProps = $props();

  const node = $derived(
    areaChartNodes({
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
