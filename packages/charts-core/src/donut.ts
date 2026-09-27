import { pathRound } from "d3-path";
import { arc, pie, type PieArcDatum } from "d3-shape";
import { round } from "./types.js";

/** One input slice: a labelled share of the whole. */
export interface DonutDatum {
  name?: string;
  value: number;
}

export interface DonutChartOptions {
  width: number;
  height: number;
  data: readonly DonutDatum[];
  /** Hole size as a fraction of the outer radius (0–1). `0` draws a pie. Default 0.6. */
  innerRadius?: number;
  /** Gap between neighbouring slices, in radians. Default 0. */
  padAngle?: number;
}

/** A slice in pixel space. `index` is the datum's position in `data`. */
export interface DonutSlice {
  name?: string;
  value: number;
  index: number;
  startAngle: number;
  endAngle: number;
  /** SVG path `d` for the ring segment, in absolute viewport coordinates. */
  path: string;
}

export interface DonutChartModel {
  width: number;
  height: number;
  center: { x: number; y: number };
  outerRadius: number;
  innerRadius: number;
  slices: DonutSlice[];
}

/** Decimals kept in slice paths — compact, stable SVG. */
const PATH_DIGITS = 2;

/** Offsets every drawing call by the chart centre, so paths need no transform. */
function centredPath(cx: number, cy: number) {
  const target = pathRound(PATH_DIGITS);
  return {
    moveTo: (x: number, y: number) => target.moveTo(x + cx, y + cy),
    lineTo: (x: number, y: number) => target.lineTo(x + cx, y + cy),
    arc: (x: number, y: number, r: number, a0: number, a1: number, ccw?: boolean) =>
      target.arc(x + cx, y + cy, r, a0, a1, ccw),
    closePath: () => target.closePath(),
    toString: () => target.toString(),
  };
}

/** A datum paired with its position in `data`, which picks its series colour. */
interface IndexedDatum {
  datum: DonutDatum;
  index: number;
}

/** Only a finite, positive value takes up part of the ring. */
function isDrawable(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}

/**
 * Build a donut chart model: one ring segment per datum, sized by its share of
 * the total and laid out clockwise from 12 o'clock in input order (never
 * re-sorted). A datum whose value is not a finite positive number draws no
 * slice and takes no room (not even a padAngle gap); the others keep
 * their own index, so a slice's colour never shifts when a neighbour is empty.
 */
export function buildDonutChart(options: DonutChartOptions): DonutChartModel {
  const outerRadius = round(Math.max(0, Math.min(options.width, options.height) / 2));
  const innerRadius = round(outerRadius * clamp(options.innerRadius ?? 0.6, 0, 1));
  const center = { x: round(options.width / 2), y: round(options.height / 2) };

  // Only drawable entries go into the pie, so an empty share reserves no
  // angle and no padAngle gap; each keeps its position in `data`.
  const drawable = options.data.flatMap((datum, index) =>
    isDrawable(datum.value) ? [{ datum, index }] : [],
  );

  const arcs = pie<IndexedDatum>()
    .value((d) => d.datum.value)
    .sort(null)
    .padAngle(options.padAngle ?? 0)(drawable);

  const segment = arc<PieArcDatum<IndexedDatum>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);
  type ArcContext = Parameters<typeof segment.context>[0];

  const slices = arcs.map((a): DonutSlice => {
    const path = centredPath(center.x, center.y);
    segment.context(path as ArcContext)(a);
    return {
      name: a.data.datum.name,
      value: a.data.datum.value,
      index: a.data.index,
      startAngle: round(a.startAngle, 4),
      endAngle: round(a.endAngle, 4),
      path: path.toString(),
    };
  });

  return { width: options.width, height: options.height, center, outerRadius, innerRadius, slices };
}
