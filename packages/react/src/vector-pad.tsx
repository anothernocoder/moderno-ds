import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type ComponentPropsWithRef,
} from "react";
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react";
import { NumberInput as ArkNumberInput } from "@ark-ui/react";
import type { NumberInputValueChangeDetails } from "@ark-ui/react";
import {
  numberInputRecipe,
  vectorPad,
  vectorPadRecipe,
  type VectorPadSize,
} from "@moderno-ui/core";

export type { VectorPadSize } from "@moderno-ui/core";
/** A VectorPad value: `{ x, y }`. */
export type VectorPadValue = vectorPad.Value;
/** One of the pad's axes: `"x"` or `"y"`. */
export type VectorPadAxis = vectorPad.Axis;
/** What `onValueChange` and `onValueChangeEnd` report: `{ value }`. */
export type VectorPadValueChangeDetails = vectorPad.ValueChangeDetails;

/** `VectorPad.Root`: the machine's props, the `size` recipe, and the root `<div>`'s own. */
export interface VectorPadRootProps
  extends
    Omit<ComponentPropsWithRef<"div">, keyof vectorPad.Props | "defaultValue">,
    Omit<vectorPad.Props, "id"> {
  /** The machine's id, which every part's id starts from. Generated when omitted. */
  id?: string;
  /** Pad side, field height and type — resolves to `data-size` on the root part. */
  size?: VectorPadSize;
}

export type VectorPadLabelProps = ComponentPropsWithRef<"label">;
export type VectorPadControlProps = ComponentPropsWithRef<"div">;
export type VectorPadGridProps = ComponentPropsWithRef<"div">;
export type VectorPadCrosshairProps = ComponentPropsWithRef<"div">;
export type VectorPadThumbProps = ComponentPropsWithRef<"div">;

/** `VectorPad.Input`: one axis as a number field; its other props go on the `<input>`. */
export interface VectorPadInputProps extends ComponentPropsWithRef<"input"> {
  /** The axis this field shows and sets. */
  axis: VectorPadAxis;
  /** The field's visible name. Defaults to `"X"` or `"Y"`. */
  label?: string;
}

/** What the Root tells its parts: the connected machine and what the fields need. */
interface VectorPadContextValue {
  api: vectorPad.Api;
  size?: VectorPadSize;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}

const VectorPadContext = createContext<VectorPadContextValue | null>(null);

function useVectorPadContext(): VectorPadContextValue {
  const context = useContext(VectorPadContext);
  if (!context) throw new Error("VectorPad parts must be inside VectorPad.Root.");
  return context;
}

/** VectorPad.Root: runs the machine and holds the pad, the label and the fields. */
function VectorPadRoot({ size, ...props }: VectorPadRootProps) {
  const [machineProps, rest] = vectorPad.splitProps(props);
  const generatedId = useId();
  const service = useMachine(vectorPad.machine, {
    ...machineProps,
    id: machineProps.id ?? generatedId,
  });
  const api = vectorPad.connect(service, normalizeProps);
  const { disabled, readOnly, invalid } = machineProps;

  return (
    <VectorPadContext.Provider value={{ api, size, disabled, readOnly, invalid }}>
      <div {...mergeProps(api.getRootProps(), vectorPadRecipe({ size }), rest)} />
    </VectorPadContext.Provider>
  );
}

function VectorPadLabel(props: VectorPadLabelProps) {
  const { api } = useVectorPadContext();
  return <label {...mergeProps(api.getLabelProps(), props)} />;
}

function VectorPadControl(props: VectorPadControlProps) {
  const { api } = useVectorPadContext();
  return <div {...mergeProps(api.getControlProps(), props)} />;
}

function VectorPadGrid(props: VectorPadGridProps) {
  const { api } = useVectorPadContext();
  return <div {...mergeProps(api.getGridProps(), props)} />;
}

function VectorPadCrosshair(props: VectorPadCrosshairProps) {
  const { api } = useVectorPadContext();
  return <div {...mergeProps(api.getCrosshairProps(), props)} />;
}

function VectorPadThumb(props: VectorPadThumbProps) {
  const { api } = useVectorPadContext();
  return <div {...mergeProps(api.getThumbProps(), props)} />;
}

/**
 * VectorPad.Input — one axis as an Ark NumberInput, kept in step with the
 * handle both ways. What the user types moves the handle at once, kept in
 * the range and on the step; the text itself is left alone while they type
 * and settles to the handle's value when they commit it (blur or Enter).
 */
function VectorPadInput({ axis, label, ...props }: VectorPadInputProps) {
  const { api, size, disabled, readOnly, invalid } = useVectorPadContext();
  const axisValue = api.value[axis];
  const [text, setText] = useState(() => String(axisValue));
  const [textValue, setTextValue] = useState(axisValue);

  // The handle moved on its own: show its value.
  useEffect(() => {
    if (axisValue === textValue) return;
    setText(String(axisValue));
    setTextValue(axisValue);
  }, [axisValue, textValue]);

  function handleValueChange({ value, valueAsNumber }: NumberInputValueChangeDetails) {
    setText(value);
    if (Number.isNaN(valueAsNumber)) return;
    const next = vectorPad.snapAxisValue(valueAsNumber, axis, api.bounds);
    setTextValue(next);
    api.setAxisValue(axis, next);
  }

  function handleValueCommit() {
    setText(String(axisValue));
    setTextValue(axisValue);
  }

  return (
    <ArkNumberInput.Root
      {...numberInputRecipe({ size })}
      data-axis={axis}
      value={text}
      min={api.bounds.min[axis]}
      max={api.bounds.max[axis]}
      step={api.bounds.step[axis]}
      disabled={disabled}
      readOnly={readOnly}
      invalid={invalid}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
    >
      <ArkNumberInput.Control>
        <ArkNumberInput.Label>{label ?? axis.toUpperCase()}</ArkNumberInput.Label>
        <ArkNumberInput.Input {...props} />
      </ArkNumberInput.Control>
    </ArkNumberInput.Root>
  );
}

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
 * `Input` per axis. The object is annotated so the emitted `.d.ts` names
 * each part.
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
