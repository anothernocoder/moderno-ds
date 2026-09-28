import VectorPadRoot from "../VectorPadRoot.svelte";
import VectorPadLabel from "../VectorPadLabel.svelte";
import VectorPadControl from "../VectorPadControl.svelte";
import VectorPadGrid from "../VectorPadGrid.svelte";
import VectorPadCrosshair from "../VectorPadCrosshair.svelte";
import VectorPadThumb from "../VectorPadThumb.svelte";
import VectorPadInput from "../VectorPadInput.svelte";

/**
 * VectorPad — a square pad with a handle you drag to set two values at once
 * (x and y: a position, an offset, a light direction), with a number field
 * per axis beside it. y grows upward, as on a graph (`invertY` flips it).
 *
 * Moderno's `vectorPad` machine (from `@moderno-ui/core`) drives it: a
 * press anywhere on the `Control` moves the `Thumb` there and a drag keeps
 * it following the pointer, held at the pad's edges; the `Thumb` is a
 * `role="slider"` that says both values, moves one `step` per arrow (ten
 * with Shift) and goes back to `defaultValue` on Home or a double-click.
 * Anatomy: `Root > Label + Control > Grid + Crosshair + Thumb`, then one
 * `Input` per axis.
 */
export const VectorPad: {
  Root: typeof VectorPadRoot;
  Label: typeof VectorPadLabel;
  Control: typeof VectorPadControl;
  Grid: typeof VectorPadGrid;
  Crosshair: typeof VectorPadCrosshair;
  Thumb: typeof VectorPadThumb;
  Input: typeof VectorPadInput;
} = {
  Root: VectorPadRoot,
  Label: VectorPadLabel,
  Control: VectorPadControl,
  Grid: VectorPadGrid,
  Crosshair: VectorPadCrosshair,
  Thumb: VectorPadThumb,
  Input: VectorPadInput,
};
export type { VectorPadSize } from "@moderno-ui/core";
export type {
  VectorPadValue,
  VectorPadAxis,
  VectorPadValueChangeDetails,
  VectorPadRootProps,
  VectorPadInputProps,
} from "../vector-pad-props.js";
