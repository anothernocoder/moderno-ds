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
 * and a value over `max` fills the track and no more.
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
    return {
      name: item.name,
      value: item.value,
      valueLabel: format(item.value),
      center: round(center),
      track,
      bar: { ...track, width: round(trackWidth * clamp(item.value / max, 0, 1)) },
    };
  });

  return {
    width: options.width,
    height: round(rows.length * rowHeight),
    radius: round(barHeight / 2),
    rows,
  };
}

/** A sorted copy of the items; `Array.prototype.sort` is stable, so ties keep their order. */
function sortItems(data: readonly BarListItem[], sort: BarListSort): BarListItem[] {
  const items = [...data];
  if (sort === "descending") items.sort((a, b) => b.value - a.value);
  if (sort === "ascending") items.sort((a, b) => a.value - b.value);
  return items;
}

/** The value a full track stands for. Never 0 or below, so a bar's share is always defined. */
function fullTrackValue(items: readonly BarListItem[], max: number | undefined): number {
  const value = max ?? maxOf(items, (item) => item.value) ?? 0;
  return value > 0 ? value : 1;
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}
