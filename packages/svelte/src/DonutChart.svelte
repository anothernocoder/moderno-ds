<!--
  DonutChart — builds the render tree with `donutChartNodes` and hands it to
  the Chart walker. Slice geometry and data-part structure all come from
  charts-core; this file holds none of it.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { donutChartNodes, type DonutChartOptions } from "@moderno-ui/charts-core";
  import Chart from "./Chart.svelte";

  type SvgProps = Omit<SVGAttributes<SVGSVGElement>, "width" | "height">;

  let { width, height, data, innerRadius, padAngle, ...rest }: DonutChartOptions & SvgProps =
    $props();

  const node = $derived(donutChartNodes({ width, height, data, innerRadius, padAngle }));
</script>

<Chart {node} {...rest} />
