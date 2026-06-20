import { extent } from "d3-array";
import { scaleBand, scaleLinear, scalePoint } from "d3-scale";

/** A continuous numeric scale, framework-agnostic and DOM-free. */
export interface LinearScale {
  (value: number): number;
  invert(pixel: number): number;
  ticks(count?: number): number[];
  readonly domain: readonly [number, number];
  readonly range: readonly [number, number];
}

export interface LinearScaleOptions {
  domain: readonly [number, number];
  range: readonly [number, number];
  /** Round the domain outward to human-friendly bounds. */
  nice?: boolean;
}

export function createLinearScale(options: LinearScaleOptions): LinearScale {
  const d3 = scaleLinear()
    .domain([...options.domain])
    .range([...options.range]);
  if (options.nice) d3.nice();

  const scale = ((value: number) => d3(value)) as LinearScale;
  return Object.assign(scale, {
    invert: (pixel: number) => d3.invert(pixel),
    ticks: (count = 10) => d3.ticks(count),
    domain: d3.domain() as [number, number],
    range: d3.range() as [number, number],
  });
}

/** Derive a rounded numeric domain from a set of values. Falls back to [0, 1]. */
export function niceLinearDomain(values: Iterable<number>): [number, number] {
  const [min, max] = extent(values);
  if (min === undefined || max === undefined) return [0, 1];
  return scaleLinear()
    .domain([Math.min(0, min), Math.max(0, max)])
    .nice()
    .domain() as [number, number];
}

/** A categorical band scale — one slot per category, used for bar charts. */
export interface BandScale {
  (value: string): number | undefined;
  readonly bandwidth: number;
  readonly step: number;
  readonly domain: readonly string[];
  readonly range: readonly [number, number];
}

export interface BandScaleOptions {
  domain: readonly string[];
  range: readonly [number, number];
  /** Inner + outer padding as a fraction of the step (0–1). */
  padding?: number;
}

export function createBandScale(options: BandScaleOptions): BandScale {
  const d3 = scaleBand<string>()
    .domain([...options.domain])
    .range([...options.range])
    .padding(options.padding ?? 0.1);

  const scale = ((value: string) => d3(value)) as BandScale;
  return Object.assign(scale, {
    bandwidth: d3.bandwidth(),
    step: d3.step(),
    domain: d3.domain(),
    range: d3.range() as [number, number],
  });
}

/** A categorical point scale — zero-width positions, used for line/scatter. */
export interface PointScale {
  (value: string): number | undefined;
  readonly step: number;
  readonly domain: readonly string[];
  readonly range: readonly [number, number];
}

export interface PointScaleOptions {
  domain: readonly string[];
  range: readonly [number, number];
  padding?: number;
}

export function createPointScale(options: PointScaleOptions): PointScale {
  const d3 = scalePoint<string>()
    .domain([...options.domain])
    .range([...options.range])
    .padding(options.padding ?? 0);

  const scale = ((value: string) => d3(value)) as PointScale;
  return Object.assign(scale, {
    step: d3.step(),
    domain: d3.domain(),
    range: d3.range() as [number, number],
  });
}
