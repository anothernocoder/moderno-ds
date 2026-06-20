<!--
  Shared chart frame, ported to Svelte 5. The Svelte twin of React's `ChartFrame`:
  root <svg> + grid + axes + tick labels, then the series snippet. Every
  coordinate comes from `@moderno/charts-core`; this holds zero colour/style —
  series paint from `--chart-*` via the data-series index in components.css.
  The same SVG serialises on server and client because the model is deterministic
  and DOM-free (F4.4).
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SVGAttributes } from "svelte/elements";
  import { partAttrs } from "@moderno/core";

  const LABEL_GAP = 8;

  /** The frame fields every chart model shares. */
  interface FrameModel {
    width: number;
    height: number;
    plot: { x: number; y: number; width: number; height: number };
    xAxis: { value: number; position: number; label: string }[];
    yAxis: { value: number; position: number; label: string }[];
  }

  // `width`/`height` are numeric chart dimensions and `format` is the chart's
  // tick formatter — all collide with native SVG attributes, so drop them.
  // `type` is our discriminator prop and likewise shadows SVG's `type`.
  type SvgProps = Omit<
    SVGAttributes<SVGSVGElement>,
    "width" | "height" | "format" | "radius" | "type"
  >;

  let {
    type,
    model,
    children,
    ...rest
  }: { type: string; model: FrameModel; children: Snippet } & SvgProps = $props();

  const plot = $derived(model.plot);
  const xAxis = $derived(model.xAxis);
  const yAxis = $derived(model.yAxis);
  const width = $derived(model.width);
  const height = $derived(model.height);
  const right = $derived(plot.x + plot.width);
  const bottom = $derived(plot.y + plot.height);
</script>

<svg
  viewBox={`0 0 ${width} ${height}`}
  role="img"
  preserveAspectRatio="xMidYMid meet"
  {...rest}
  {...partAttrs("chart", "root")}
  data-chart={type}
>
  <g data-part="grid">
    {#each yAxis as t (t.value)}
      <line data-part="grid-line" x1={plot.x} y1={t.position} x2={right} y2={t.position} />
    {/each}
  </g>
  <line data-part="axis-line" x1={plot.x} y1={bottom} x2={right} y2={bottom} />
  <line data-part="axis-line" x1={plot.x} y1={plot.y} x2={plot.x} y2={bottom} />
  {#each xAxis as t (t.value)}
    <text data-part="tick-label" data-orientation="x" x={t.position} y={bottom + LABEL_GAP + 8}>
      {t.label}
    </text>
  {/each}
  {#each yAxis as t (t.value)}
    <text data-part="tick-label" data-orientation="y" x={plot.x - LABEL_GAP} y={t.position + 4}>
      {t.label}
    </text>
  {/each}
  {@render children()}
</svg>
