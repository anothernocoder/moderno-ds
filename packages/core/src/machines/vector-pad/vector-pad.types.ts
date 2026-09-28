import type { EventObject, Machine, Service } from "@zag-js/core";
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types";

/** A VectorPad value: one number per axis. */
export interface VectorPadValue {
  x: number;
  y: number;
}

/** One of the pad's two axes. */
export type VectorPadAxis = keyof VectorPadValue;

/** A `min`, `max` or `step`: one number for both axes, or one per axis. */
export type VectorPadAxisSetting = number | VectorPadValue;

/** What `onValueChange` and `onValueChangeEnd` report. */
export interface VectorPadValueChangeDetails {
  value: VectorPadValue;
}

/** The pad's range and step, resolved per axis. */
export interface VectorPadBounds {
  min: VectorPadValue;
  max: VectorPadValue;
  step: VectorPadValue;
}

/** Fractions of the pad's box, from its left and top edges: 0 to 1. */
export interface VectorPadPosition {
  left: number;
  top: number;
}

export type ElementIds = Partial<{
  root: string;
  label: string;
  control: string;
  thumb: string;
}>;

export interface VectorPadProps extends DirectionProperty, CommonProperties {
  /** The ids of the elements, for composition. */
  ids?: ElementIds | undefined;
  /** The controlled value. */
  value?: VectorPadValue | undefined;
  /** The value at first, when uncontrolled. Home and a double-click go back to it. Defaults to the centre of the range. */
  defaultValue?: VectorPadValue | undefined;
  /** The smallest value, for both axes or per axis. @default -100 */
  min?: VectorPadAxisSetting | undefined;
  /** The largest value, for both axes or per axis. @default 100 */
  max?: VectorPadAxisSetting | undefined;
  /** How far one move goes, for both axes or per axis. @default 1 */
  step?: VectorPadAxisSetting | undefined;
  /** Makes y grow downward, as on screen, instead of upward, as on a graph. The handle still follows the pointer. */
  invertY?: boolean | undefined;
  /** Whether the pad is disabled. */
  disabled?: boolean | undefined;
  /** Whether the pad shows its value but ignores input. */
  readOnly?: boolean | undefined;
  /** Whether the value is marked as wrong. */
  invalid?: boolean | undefined;
  /** What a screen reader says for a value. Defaults to `"X 20, Y -10"`. */
  getAriaValueText?: ((value: VectorPadValue) => string) | undefined;
  /** Called while the value changes. */
  onValueChange?: ((details: VectorPadValueChangeDetails) => void) | undefined;
  /** Called once a change ends: the pointer lets go, or a key sets the value. */
  onValueChangeEnd?: ((details: VectorPadValueChangeDetails) => void) | undefined;
  /** The accessible name of the pad, when it has no Label. */
  "aria-label"?: string | undefined;
  /** The id of the element that names the pad, when it is not its Label. */
  "aria-labelledby"?: string | undefined;
}

type PropsWithDefault = "min" | "max" | "step" | "defaultValue" | "getAriaValueText";

export interface VectorPadSchema {
  state: "idle" | "focused" | "dragging";
  props: RequiredBy<VectorPadProps, PropsWithDefault>;
  context: {
    value: VectorPadValue;
  };
  computed: {
    bounds: VectorPadBounds;
    interactive: boolean;
  };
  refs: {
    /** Where the pointer grabbed the handle, from its centre, in px: a drag keeps it there. */
    grabOffset: { x: number; y: number } | null;
  };
  action: string;
  event: EventObject;
  effect: string;
  guard: string;
}

export type VectorPadService = Service<VectorPadSchema>;

export type VectorPadMachine = Machine<VectorPadSchema>;

export interface VectorPadApi<T extends PropTypes = PropTypes> {
  /** The current value. */
  value: VectorPadValue;
  /** The range and step, per axis. */
  bounds: VectorPadBounds;
  /** Whether the handle is being dragged. */
  dragging: boolean;
  /** Sets both values, kept in the range and on the step. */
  setValue(value: VectorPadValue): void;
  /** Sets one axis, kept in the range and on the step. */
  setAxisValue(axis: VectorPadAxis, value: number): void;
  /** Goes back to `defaultValue`. */
  reset(): void;
  getRootProps(): T["element"];
  getLabelProps(): T["label"];
  getControlProps(): T["element"];
  getGridProps(): T["element"];
  getCrosshairProps(): T["element"];
  getThumbProps(): T["element"];
}
