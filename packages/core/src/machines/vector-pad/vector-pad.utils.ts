/**
 * The arithmetic of a VectorPad, with no DOM: resolving the range per axis,
 * keeping a value in the range and on the step, and turning a spot on the
 * pad into a value and back. The machine and every binding share it.
 */
import type {
  VectorPadAxis,
  VectorPadAxisSetting,
  VectorPadBounds,
  VectorPadPosition,
  VectorPadValue,
} from "./vector-pad.types.js";

export const DEFAULT_MIN = -100;
export const DEFAULT_MAX = 100;
export const DEFAULT_STEP = 1;

/** How many steps Shift+arrow moves the handle. */
export const SHIFT_STEPS = 10;

/** A setting for both axes (`5`) or per axis (`{ x: 5, y: 1 }`), as one number per axis. */
export function resolveAxisSetting(setting: VectorPadAxisSetting): VectorPadValue {
  return typeof setting === "number" ? { x: setting, y: setting } : setting;
}

/** The range and step per axis, from the props. */
export function resolveBounds(
  min: VectorPadAxisSetting,
  max: VectorPadAxisSetting,
  step: VectorPadAxisSetting,
): VectorPadBounds {
  return {
    min: resolveAxisSetting(min),
    max: resolveAxisSetting(max),
    step: resolveAxisSetting(step),
  };
}

/** The number of decimals in `value`, so sums of steps do not drift (`0.1 + 0.2`). */
function decimalsOf(value: number): number {
  const [, decimals = ""] = String(value).split(".");
  return decimals.length;
}

/**
 * One axis's value kept in its range and on its step, counted from `min`:
 * with a range of 0 to 10 and a step of 4, `7` is `8` and `10` is `8`.
 */
export function snapAxisValue(value: number, axis: VectorPadAxis, bounds: VectorPadBounds): number {
  const min = bounds.min[axis];
  const max = bounds.max[axis];
  const step = bounds.step[axis];
  const clamped = Math.min(Math.max(value, min), max);
  const decimals = Math.max(decimalsOf(step), decimalsOf(min));
  let snapped = Number((min + Math.round((clamped - min) / step) * step).toFixed(decimals));
  // Rounding up can land one step past `max`: take the last step inside it.
  if (snapped > max) snapped = Number((snapped - step).toFixed(decimals));
  // `-0` would show as "-0" in a field.
  return snapped === 0 ? 0 : snapped;
}

/** Both values kept in their range and on their step. */
export function snapValue(value: VectorPadValue, bounds: VectorPadBounds): VectorPadValue {
  return { x: snapAxisValue(value.x, "x", bounds), y: snapAxisValue(value.y, "y", bounds) };
}

/** The value at the centre of the range, on the step: the default `defaultValue`. */
export function centreValue(bounds: VectorPadBounds): VectorPadValue {
  return snapValue(
    { x: (bounds.min.x + bounds.max.x) / 2, y: (bounds.min.y + bounds.max.y) / 2 },
    bounds,
  );
}

/** Two values are the same point. */
export function isSameValue(a: VectorPadValue, b: VectorPadValue | undefined): boolean {
  return a.x === b?.x && a.y === b?.y;
}

/** How far along its range a value sits, from 0 to 1, clamped. */
function fractionOf(value: number, axis: VectorPadAxis, bounds: VectorPadBounds): number {
  const range = bounds.max[axis] - bounds.min[axis];
  if (range <= 0) return 0;
  return Math.min(Math.max((value - bounds.min[axis]) / range, 0), 1);
}

/**
 * Where the handle sits for a value, as fractions of the pad from its left
 * and top edges. y grows upward, so the largest y is at the top, unless
 * `invertY`.
 */
export function positionOfValue(
  value: VectorPadValue,
  bounds: VectorPadBounds,
  invertY = false,
): VectorPadPosition {
  const y = fractionOf(value.y, "y", bounds);
  return { left: fractionOf(value.x, "x", bounds), top: invertY ? y : 1 - y };
}

/**
 * The value at a spot on the pad (fractions from its left and top edges,
 * clamped to the pad), on the step. The inverse of `positionOfValue`.
 */
export function valueAtPosition(
  position: VectorPadPosition,
  bounds: VectorPadBounds,
  invertY = false,
): VectorPadValue {
  const left = Math.min(Math.max(position.left, 0), 1);
  const top = Math.min(Math.max(position.top, 0), 1);
  const up = invertY ? top : 1 - top;
  return snapValue(
    {
      x: bounds.min.x + left * (bounds.max.x - bounds.min.x),
      y: bounds.min.y + up * (bounds.max.y - bounds.min.y),
    },
    bounds,
  );
}

/** The arrow keys, as the way they move the handle on screen. */
export type VectorPadArrow = "left" | "right" | "up" | "down";

/**
 * The value after an arrow key moves the handle `steps` steps: right and up
 * move it that way on screen, so up raises y unless `invertY`.
 */
export function valueAfterArrow(
  value: VectorPadValue,
  arrow: VectorPadArrow,
  steps: number,
  bounds: VectorPadBounds,
  invertY = false,
): VectorPadValue {
  const horizontal = arrow === "left" || arrow === "right";
  const axis: VectorPadAxis = horizontal ? "x" : "y";
  const towardsEnd = arrow === "right" || arrow === (invertY ? "down" : "up");
  const delta = (towardsEnd ? 1 : -1) * steps * bounds.step[axis];
  return snapValue({ ...value, [axis]: value[axis] + delta }, bounds);
}

/** What a screen reader says for a value by default: `"X 20, Y -10"`. */
export function vectorPadValueText(value: VectorPadValue): string {
  return `X ${value.x}, Y ${value.y}`;
}
