/**
 * VectorPad's prop types and the context its Root hands to its parts, in a
 * `.ts` file rather than inside the `.svelte`s, for the same reason as
 * `callout-props.ts`: a `Props` interface declared inside a component's
 * instance script is not exported, so `index.ts` could not re-export it by
 * name.
 */
import { getContext, setContext } from "svelte";
import type { HTMLAttributes, HTMLInputAttributes } from "svelte/elements";
import type { vectorPad, VectorPadSize } from "@moderno-ui/core";

/** A VectorPad value: `{ x, y }`. */
export type VectorPadValue = vectorPad.Value;
/** One of the pad's axes: `"x"` or `"y"`. */
export type VectorPadAxis = vectorPad.Axis;
/** What `onValueChange` and `onValueChangeEnd` report: `{ value }`. */
export type VectorPadValueChangeDetails = vectorPad.ValueChangeDetails;

/**
 * `VectorPad.Root`: the machine's props (`value` is bindable), the `size`
 * recipe, and the root `<div>`'s own.
 */
export interface VectorPadRootProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, keyof vectorPad.Props | "defaultValue">,
    Omit<vectorPad.Props, "id"> {
  /** The machine's id, which every part's id starts from. Generated when omitted. */
  id?: string;
  /** Pad side, field height and type — resolves to `data-size` on the root part. */
  size?: VectorPadSize;
}

/** `VectorPad.Input`: one axis as a number field; its other props go on the `<input>`. */
export interface VectorPadInputProps extends HTMLInputAttributes {
  /** The axis this field shows and sets. */
  axis: VectorPadAxis;
  /** The field's visible name. Defaults to `"X"` or `"Y"`. */
  label?: string;
}

/** What the Root tells its parts: the connected machine and what the fields need. */
export interface VectorPadContext {
  readonly api: vectorPad.Api;
  readonly size?: VectorPadSize;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
}

const CONTEXT = Symbol("ModernoVectorPad");

/** The Root hands its machine to the parts inside it. */
export function setVectorPadContext(context: VectorPadContext): void {
  setContext(CONTEXT, context);
}

/** A part reads the nearest Root's machine; it has no meaning outside one. */
export function getVectorPadContext(): VectorPadContext {
  const context = getContext<VectorPadContext | undefined>(CONTEXT);
  if (!context) throw new Error("VectorPad parts must be inside VectorPad.Root.");
  return context;
}
