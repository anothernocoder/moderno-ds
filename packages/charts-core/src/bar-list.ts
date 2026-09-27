import { max as maxOf } from "d3-array";
import { defaultFormat } from "./frame.js";
import { round } from "./types.js";

/** One row of a bar list: what it is called and how much it holds. */
export interface BarListItem {
  name: string;
  value: number;
}

export interface BarListOptions {
  /** Width of the drawing, in viewBox units. The height follows from the rows. */
  width: number;
  /** One row per item: `{ name, value }`. */
  data: readonly BarListItem[];
  /** The value that fills a whole track. Default: the largest value. */
  max?: number;
  /** Row order. Default `descending`, largest first; `none` keeps the order of `data`. */
  sort?: "descending" | "ascending" | "none";
  /** Space for the name column, before the track starts. Default 120. */
  labelWidth?: number;
  /** Space for the value column, after the track ends. Default 64. */
  valueWidth?: number;
  /** Height of one row, spacing included. Default 32. */
  rowHeight?: number;
  /** Thickness of the track and its bar. Default 8. */
  barHeight?: number;
  /** Format a value into the text at the end of its row. */
  format?: (value: number) => string;
}

/** The order rows are drawn in. */
export type BarListSort = NonNullable<BarListOptions["sort"]>;

/** A rectangle in pixel space. */
export interface BarListRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BarListRow {
  name: string;
  value: number;
  /** The value as printed at the end of the row. */
  valueLabel: string;
  /** Vertical centre of the row: the name, the bar and the value line up on it. */
  center: number;
  /** The full-length groove the bar fills. */
  track: BarListRect;
  /** The filled part of the track, as long as the value is against `max`. */
  bar: BarListRect;
}

export interface BarListModel {
  width: number;
  /** Rows × row height: the list grows with its data. */
  height: number;
  /** Corner radius of every track and bar: half their thickness, so they end round. */
  radius: number;
  rows: BarListRow[];
}

const DEFAULT_LABEL_WIDTH = 120;
const DEFAULT_VALUE_WIDTH = 64;
const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_BAR_HEIGHT = 8;

/**
 * Build a bar list: one row per item, each a name, a track and a value. The
 * track spans the room left between the name and value columns; the bar fills
 * it in proportion to `value / max`, clamped so a negative value draws nothing
 * and a value over `max` fills the track and no more. A value that is not a
 * finite number (NaN, ±Infinity) draws no bar, prints no value, takes no part
 * in the default `max` and goes after every finite row.
 */
export function buildBarList(options: BarListOptions): BarListModel {
  const labelWidth = options.labelWidth ?? DEFAULT_LABEL_WIDTH;
  const valueWidth = options.valueWidth ?? DEFAULT_VALUE_WIDTH;
  const rowHeight = options.rowHeight ?? DEFAULT_ROW_HEIGHT;
  const barHeight = options.barHeight ?? DEFAULT_BAR_HEIGHT;
  const format = options.format ?? defaultFormat;

  const items = sortItems(options.data, options.sort ?? "descending");
  const max = fullTrackValue(items, options.max);
  const trackWidth = Math.max(0, options.width - labelWidth - valueWidth);

  const rows = items.map((item, index): BarListRow => {
    const center = index * rowHeight + rowHeight / 2;
    const track = {
      x: labelWidth,
      y: round(center - barHeight / 2),
      width: round(trackWidth),
      height: barHeight,
    };
    const share = isDrawable(item.value) ? clamp(item.value / max, 0, 1) : 0;
    return {
      name: item.name,
      value: item.value,
      valueLabel: isDrawable(item.value) ? format(item.value) : "",
      center: round(center),
      track,
      bar: { ...track, width: round(trackWidth * share) },
    };
  });

  return {
    width: options.width,
    height: round(rows.length * rowHeight),
    radius: round(barHeight / 2),
    rows,
  };
}

/** Only a finite value has a length on the track; NaN and ±Infinity draw nothing. */
function isDrawable(value: number): boolean {
  return Number.isFinite(value);
}

/**
 * A sorted copy of the items. Rows that draw nothing go last, in data order, so
 * they never break the ranking of the others; `Array.prototype.sort` is stable,
 * so ties keep their order too.
 */
function sortItems(data: readonly BarListItem[], sort: BarListSort): BarListItem[] {
  if (sort === "none") return [...data];
  const drawable = data.filter((item) => isDrawable(item.value));
  const empty = data.filter((item) => !isDrawable(item.value));
  const direction = sort === "descending" ? -1 : 1;
  drawable.sort((a, b) => direction * (a.value - b.value));
  return [...drawable, ...empty];
}

/**
 * The value a full track stands for: `max` when it is a finite number, else the
 * largest finite value. Never 0 or below, so a bar's share is always defined.
 */
function fullTrackValue(items: readonly BarListItem[], max: number | undefined): number {
  const largest = maxOf(items, (item) => (isDrawable(item.value) ? item.value : undefined));
  const value = max !== undefined && isDrawable(max) ? max : (largest ?? 0);
  return value > 0 ? value : 1;
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}
