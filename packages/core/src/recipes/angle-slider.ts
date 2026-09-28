import { cva, type VariantProps } from "../cva.js";

/**
 * AngleSlider: `size` on the root — the dial's diameter, the angle field's
 * height and the type of the label. The value, step, disabled, read-only and
 * invalid are Ark's own props; dragging, focus and disabled surface as Ark's
 * `data-*`. The rest of this file is the angle arithmetic every binding
 * shares: wrapping past a full turn, snapping to the step or to the marks,
 * Page Up / Page Down, and the text a screen reader says.
 */
export const angleSliderRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** AngleSlider's density (dial diameter, field height, type), shared by every part. */
export type AngleSliderSize = NonNullable<VariantProps<typeof angleSliderRecipe.variants>["size"]>;

/** One full turn of the dial, in degrees. */
const FULL_TURN = 360;

/** How far Page Up and Page Down turn the dial, at the least, in degrees. */
const PAGE_STEP = 15;

/** The number of decimals in `step`, so sums of steps do not drift (`0.1 + 0.2`). */
function stepDecimals(step: number): number {
  const [, decimals = ""] = String(step).split(".");
  return decimals.length;
}

/** `value` rounded to the nearest multiple of `step`, without float noise. */
function roundToStep(value: number, step: number): number {
  return Number((Math.round(value / step) * step).toFixed(stepDecimals(step)));
}

/**
 * Any angle brought into one turn, 0 up to (not including) 360: `360` is
 * `0`, `370` is `10`, `-30` is `330`. This is what lets a drag go past 360°
 * and carry on from 0° without a jump.
 */
export function wrapAngle(value: number): number {
  // Subtracting whole turns keeps an angle already in range exact (0.3 stays 0.3).
  const wrapped = value - FULL_TURN * Math.floor(value / FULL_TURN);
  // `-0 % 360` is `-0`; the dial never shows it.
  return wrapped === 0 ? 0 : wrapped;
}

/** An angle rounded to the nearest multiple of `step`, then wrapped: 350 at step 45 is 0. */
export function snapAngleToStep(value: number, step: number): number {
  return wrapAngle(roundToStep(value, step));
}

/** How far apart two angles are around the dial: 350° and 10° are 20° apart. */
function angleDistance(a: number, b: number): number {
  const gap = Math.abs(wrapAngle(a) - wrapAngle(b));
  return Math.min(gap, FULL_TURN - gap);
}

/**
 * The mark nearest to `value`, measured around the dial, so 350° snaps to a
 * mark at 0°. With no marks, `value` is returned unchanged.
 */
export function snapAngleToMarks(value: number, marks: readonly number[]): number {
  let nearest = value;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const mark of marks) {
    const distance = angleDistance(value, mark);
    if (distance < nearestDistance) {
      nearest = wrapAngle(mark);
      nearestDistance = distance;
    }
  }
  return nearest;
}

/** What the Root does with each value Ark reports, before the consumer sees it. */
export interface ResolveAngleOptions {
  /** The snap marks, in degrees. */
  marks?: readonly number[];
  /** Snap to the nearest mark: the user holds Shift while dragging. */
  snapToMarks?: boolean;
}

/**
 * The angle the dial settles on for a value Ark reports: wrapped into one
 * turn, then pulled to the nearest mark while the user holds Shift.
 */
export function resolveAngle(
  value: number,
  { marks, snapToMarks }: ResolveAngleOptions = {},
): number {
  const angle = wrapAngle(value);
  return snapToMarks && marks?.length ? snapAngleToMarks(angle, marks) : angle;
}

/**
 * The value after Page Up (`direction` 1) or Page Down (-1): 15° further, or
 * the smallest whole number of steps that covers 15°, on the step grid and
 * kept between 0° and the last step before a full turn, as Ark keeps the
 * arrow keys.
 */
export function angleSliderPageValue(value: number, step: number, direction: 1 | -1): number {
  const pageStep = Math.ceil(PAGE_STEP / step) * step;
  const lastStep = roundToStep(Math.floor((FULL_TURN - 1) / step) * step, step);
  const next = roundToStep(value + direction * pageStep, step);
  return Math.min(Math.max(next, 0), lastStep);
}

/** What `onValueChange` and `onValueChangeEnd` report. */
export interface AngleSliderValueChangeDetails {
  /** The angle, in degrees, from 0 up to (not including) 360. */
  value: number;
  /** The same angle as a CSS angle, like `"45deg"`, for a `rotate` or a gradient. */
  valueAsDegree: string;
}

/** The details a change reports for `value`. */
export function angleSliderChangeDetails(value: number): AngleSliderValueChangeDetails {
  return { value, valueAsDegree: `${value}deg` };
}

/** The pointer events that tell whether Shift is held during a press. */
export const ANGLE_SLIDER_SHIFT_EVENTS = [
  "pointerdown",
  "pointermove",
  "pointerup",
  "pointercancel",
] as const;

/** The part of a pointer event the Shift tracker reads. */
export interface ShiftPointerEvent {
  type: string;
  shiftKey: boolean;
}

/**
 * Whether the user holds Shift while pressing the pointer. Each binding
 * listens for `ANGLE_SLIDER_SHIFT_EVENTS` on the document, in the capture
 * phase so it hears a move before Ark's drag handler does, and hands them to
 * `track`. Letting go clears it, so a later arrow key is never read as a
 * Shift-drag.
 */
export function createShiftTracker(): {
  track: (event: ShiftPointerEvent) => void;
  isHeld: () => boolean;
} {
  let held = false;
  return {
    track(event) {
      held = event.type !== "pointerup" && event.type !== "pointercancel" && event.shiftKey;
    },
    isHeld: () => held,
  };
}

/** What a screen reader says for an angle when the consumer does not say otherwise. */
export function angleSliderValueText(value: number): string {
  return `${value} degrees`;
}

/**
 * The number format of the angle field: the value with a `°` after it
 * (`45°`), in every locale, and up to two decimals for a fractional step.
 */
export const angleSliderInputFormat: Intl.NumberFormatOptions = {
  style: "unit",
  unit: "degree",
  unitDisplay: "narrow",
  maximumFractionDigits: 2,
};

/**
 * The angle the field's typed number sets, snapped to the step and wrapped
 * (`400` sets 40°, `-30` sets 330°), or `undefined` while the box holds no
 * number yet (empty, or a lone `-`).
 */
export function angleFromInput(valueAsNumber: number, step: number): number | undefined {
  return Number.isFinite(valueAsNumber) ? snapAngleToStep(valueAsNumber, step) : undefined;
}

/**
 * Whether the field shows the dial's angle right away rather than what was
 * typed: a number outside one turn (an arrow key past 359°, a typed `400`)
 * reads as its wrapped angle at once; one inside it waits for the commit, so
 * typing a digit at a time is never snapped from under the caret.
 */
export function isAngleOutsideTurn(valueAsNumber: number): boolean {
  return valueAsNumber < 0 || valueAsNumber >= FULL_TURN;
}
