import { For, splitProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  areaChartNodes,
  barChartNodes,
  lineChartNodes,
  scatterChartNodes,
  type AreaChartOptions,
  type BarChartOptions,
  type ChartNode,
  type LineChartOptions,
  type ScatterChartOptions,
} from "@moderno/charts-core";

/**
 * Reference SVG charts, ported to Solid. The complete render description —
 * geometry, label anchors, and the `data-part` structure — is computed in
 * `@moderno/charts-core`; these components only walk the node tree (F4.2).
 * They hold zero colour — series paint from `--chart-*` via the data-series
 * index in `components.css`, axes/grid from semantic slots. Because the tree is
 * deterministic and DOM-free, the same SVG serialises on server and client
 * (F4.4) — parity with the core's reference serialization is tested.
 */

// `width`/`height` are numeric chart dimensions and `format` is the chart's
// tick formatter — both collide with native SVG attributes, so drop them here.
type SvgProps = Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "width" | "height" | "format">;

function Nodes(props: { nodes: ChartNode[] }): JSX.Element {
  return (
    <For each={props.nodes}>
      {(n) => (
        <Dynamic component={n.tag} {...n.attrs}>
          {n.text ?? (n.children && <Nodes nodes={n.children} />)}
        </Dynamic>
      )}
    </For>
  );
}

function Chart(props: { node: ChartNode } & SvgProps) {
  const [local, rest] = splitProps(props, ["node"]);
  // Consumer props spread first; the contract attrs land last and can't be
  // clobbered.
  return (
    <svg {...rest} {...local.node.attrs}>
      <Nodes nodes={local.node.children ?? []} />
    </svg>
  );
}

// ── Line ────────────────────────────────────────────────────────────────────
export interface LineChartProps extends LineChartOptions, SvgProps {}

export function LineChart(props: LineChartProps) {
  const [local, rest] = splitProps(props, [
    "width",
    "height",
    "margin",
    "series",
    "xDomain",
    "yDomain",
    "xTicks",
    "yTicks",
    "format",
    "curve",
  ]);
  return <Chart node={lineChartNodes(local)} {...rest} />;
}

// ── Area ────────────────────────────────────────────────────────────────────
export interface AreaChartProps extends AreaChartOptions, SvgProps {}

export function AreaChart(props: AreaChartProps) {
  const [local, rest] = splitProps(props, [
    "width",
    "height",
    "margin",
    "series",
    "xDomain",
    "yDomain",
    "xTicks",
    "yTicks",
    "format",
    "curve",
  ]);
  return <Chart node={areaChartNodes(local)} {...rest} />;
}

// ── Bar ─────────────────────────────────────────────────────────────────────
export interface BarChartProps extends BarChartOptions, SvgProps {}

export function BarChart(props: BarChartProps) {
  const [local, rest] = splitProps(props, [
    "width",
    "height",
    "margin",
    "categories",
    "series",
    "yDomain",
    "yTicks",
    "padding",
    "format",
  ]);
  return <Chart node={barChartNodes(local)} {...rest} />;
}

// ── Scatter ──────────────────────────────────────────────────────────────────
export interface ScatterChartProps extends ScatterChartOptions, SvgProps {}

export function ScatterChart(props: ScatterChartProps) {
  const [local, rest] = splitProps(props, [
    "width",
    "height",
    "margin",
    "series",
    "xDomain",
    "yDomain",
    "xTicks",
    "yTicks",
    "format",
    "radius",
  ]);
  return <Chart node={scatterChartNodes(local)} {...rest} />;
}
