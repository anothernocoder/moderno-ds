<!--
  BarList — builds the render tree with `barListNodes` and hands it to the
  Chart walker. Row layout, bar lengths and data-part structure all come from
  charts-core; this file holds none of it.
-->
<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { barListNodes, type BarListOptions } from "@moderno-ui/charts-core";
  import Chart from "./Chart.svelte";

  // `max` is the value a full track stands for, not SVG's animation attribute.
  type SvgProps = Omit<SVGAttributes<SVGSVGElement>, "width" | "height" | "format" | "max">;

  let {
    width,
    data,
    max,
    sort,
    labelWidth,
    valueWidth,
    rowHeight,
    barHeight,
    format,
    ...rest
  }: BarListOptions & SvgProps = $props();

  const node = $derived(
    barListNodes({
      width,
      data,
      max,
      sort,
      labelWidth,
      valueWidth,
      rowHeight,
      barHeight,
      format,
    }),
  );
</script>

<Chart {node} {...rest} />
