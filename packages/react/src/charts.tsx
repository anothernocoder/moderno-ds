import { createElement, type ComponentPropsWithRef, type ReactNode } from "react";
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
 * Reference SVG charts. The complete render description — geometry, label
 * anchors, and the `data-part` structure — is computed in
 * `@moderno/charts-core`; these components only walk the node tree (F4.2).
 * They hold zero colour — series paint from `--chart-*` via the data-series
 * index in `components.css`, axes/grid from semantic slots. Because the tree is
 * deterministic and DOM-free, the same SVG serialises on server and client
 * (F4.4) — parity with the core's reference serialization is tested.
 */

// `width`/`height` are numeric chart dimensions and `format` is the chart's
// tick formatter — both collide with native SVG attributes, so drop them here.
type SvgProps = Omit<ComponentPropsWithRef<"svg">, "width" | "height" | "format" | "radius">;

function walk(node: ChartNode, key: number): ReactNode {
  return createElement(node.tag, { key, ...node.attrs }, node.text ?? node.children?.map(walk));
}

function Chart({ node, ...rest }: { node: ChartNode } & SvgProps) {
  // Consumer props spread first; the contract attrs land last and can't be
  // clobbered.
  return createElement("svg", { ...rest, ...node.attrs }, node.children?.map(walk));
}

// ── Line ────────────────────────────────────────────────────────────────────
export interface LineChartProps extends LineChartOptions, SvgProps {}

export function LineChart({
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
}: LineChartProps) {
  const node = lineChartNodes({
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
  });
  return <Chart node={node} {...rest} />;
}

// ── Area ────────────────────────────────────────────────────────────────────
export interface AreaChartProps extends AreaChartOptions, SvgProps {}

export function AreaChart({
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
}: AreaChartProps) {
  const node = areaChartNodes({
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
  });
  return <Chart node={node} {...rest} />;
}

// ── Bar ─────────────────────────────────────────────────────────────────────
export interface BarChartProps extends BarChartOptions, SvgProps {}

export function BarChart({
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
}: BarChartProps) {
  const node = barChartNodes({
    width,
    height,
    margin,
    categories,
    series,
    yDomain,
    yTicks,
    padding,
    format,
  });
  return <Chart node={node} {...rest} />;
}

// ── Scatter ──────────────────────────────────────────────────────────────────
export interface ScatterChartProps extends ScatterChartOptions, SvgProps {}

export function ScatterChart({
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
}: ScatterChartProps) {
  const node = scatterChartNodes({
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
  });
  return <Chart node={node} {...rest} />;
}
