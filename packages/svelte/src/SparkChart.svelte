<!--
  SparkChart — builds the render tree with `sparkChartNodes` and hands it to
  the Chart walker. Geometry and data-part structure all come from
  charts-core; this file holds none of it.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { sparkChartNodes, type SparkChartOptions } from "@moderno-ui/charts-core";
  import Chart from "./Chart.svelte";

  // `points` is the data here, not the SVG polyline attribute.
  type SvgProps = Omit<SVGAttributes<SVGSVGElement>, "width" | "height" | "points">;

  let {
    points,
    width,
    height,
    yDomain,
    curve,
    area,
    showLastPoint,
    ...rest
  }: SparkChartOptions & SvgProps = $props();

  const node = $derived(
    sparkChartNodes({ points, width, height, yDomain, curve, area, showLastPoint }),
  );
</script>

<Chart {node} {...rest} />
