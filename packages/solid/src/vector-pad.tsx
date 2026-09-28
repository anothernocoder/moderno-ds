import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  on,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid";
import { NumberInput as ArkNumberInput } from "@ark-ui/solid";
import type { NumberInputValueChangeDetails } from "@ark-ui/solid";
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
export type VectorPadRootProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  keyof vectorPad.Props | "defaultValue"
> &
  Omit<vectorPad.Props, "id"> & {
    /** The machine's id, which every part's id starts from. Generated when omitted. */
    id?: string;
    /** Pad side, field height and type — resolves to `data-size` on the root part. */
    size?: VectorPadSize;
  };

/** `VectorPad.Input`: one axis as a number field; its other props go on the `<input>`. */
export type VectorPadInputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  /** The axis this field shows and sets. */
  axis: VectorPadAxis;
  /** The field's visible name. Defaults to `"X"` or `"Y"`. */
  label?: string;
};

/** What the Root tells its parts: the connected machine and what the fields need. */
interface VectorPadContextValue {
  api: Accessor<vectorPad.Api>;
  readonly size?: VectorPadSize;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
}

const VectorPadContext = createContext<VectorPadContextValue>();

function useVectorPadContext(): VectorPadContextValue {
  const context = useContext(VectorPadContext);
  if (!context) throw new Error("VectorPad parts must be inside VectorPad.Root.");
  return context;
}

/** VectorPad.Root: runs the machine and holds the pad, the label and the fields. */
function VectorPadRoot(props: VectorPadRootProps) {
  const [local, machineProps, rest] = splitProps(props, ["size", "children"], vectorPad.props);
  const generatedId = createUniqueId();
  const service = useMachine(vectorPad.machine, () => ({
    ...machineProps,
    id: machineProps.id ?? generatedId,
  }));
  const api = createMemo(() => vectorPad.connect(service, normalizeProps));

  const context: VectorPadContextValue = {
    api,
    get size() {
      return local.size;
    },
    get disabled() {
      return machineProps.disabled;
    },
    get readOnly() {
      return machineProps.readOnly;
    },
    get invalid() {
      return machineProps.invalid;
    },
  };

  const rootProps = mergeProps(
    () => api().getRootProps(),
    () => vectorPadRecipe({ size: local.size }),
    rest,
  );
  return (
    <VectorPadContext.Provider value={context}>
      <div {...rootProps}>{local.children}</div>
    </VectorPadContext.Provider>
  );
}

/*
 * Each part spreads the machine's props for it under the caller's. Its
 * children are kept out of the spread: the spread re-runs whenever the
 * machine's state changes, and would build the children again each time,
 * taking focus from the handle.
 */
function VectorPadLabel(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
  const [local, rest] = splitProps(props, ["children"]);
  const { api } = useVectorPadContext();
  return <label {...mergeProps(() => api().getLabelProps(), rest)}>{local.children}</label>;
}

function VectorPadControl(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ["children"]);
  const { api } = useVectorPadContext();
  return <div {...mergeProps(() => api().getControlProps(), rest)}>{local.children}</div>;
}

function VectorPadGrid(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ["children"]);
  const { api } = useVectorPadContext();
  return <div {...mergeProps(() => api().getGridProps(), rest)}>{local.children}</div>;
}

function VectorPadCrosshair(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ["children"]);
  const { api } = useVectorPadContext();
  return <div {...mergeProps(() => api().getCrosshairProps(), rest)}>{local.children}</div>;
}

function VectorPadThumb(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ["children"]);
  const { api } = useVectorPadContext();
  return <div {...mergeProps(() => api().getThumbProps(), rest)}>{local.children}</div>;
}

/**
 * VectorPad.Input — one axis as an Ark NumberInput, kept in step with the
 * handle both ways. What the user types moves the handle at once, kept in
 * the range and on the step; the text itself is left alone while they type
 * and settles to the handle's value when they commit it (blur or Enter).
 */
function VectorPadInput(props: VectorPadInputProps) {
  const [local, rest] = splitProps(props, ["axis", "label"]);
  const context = useVectorPadContext();
  const axisValue = () => context.api().value[local.axis];
  const bounds = () => context.api().bounds;
  const [text, setText] = createSignal(String(axisValue()));
  const [textValue, setTextValue] = createSignal(axisValue());

  // The handle moved on its own: show its value.
  createEffect(
    on(
      axisValue,
      (value) => {
        if (value === textValue()) return;
        setText(String(value));
        setTextValue(value);
      },
      { defer: true },
    ),
  );

  function handleValueChange({ value, valueAsNumber }: NumberInputValueChangeDetails) {
    setText(value);
    if (Number.isNaN(valueAsNumber)) return;
    const next = vectorPad.snapAxisValue(valueAsNumber, local.axis, bounds());
    setTextValue(next);
    context.api().setAxisValue(local.axis, next);
  }

  function handleValueCommit() {
    setText(String(axisValue()));
    setTextValue(axisValue());
  }

  return (
    <ArkNumberInput.Root
      {...numberInputRecipe({ size: context.size })}
      data-axis={local.axis}
      value={text()}
      min={bounds().min[local.axis]}
      max={bounds().max[local.axis]}
      step={bounds().step[local.axis]}
      disabled={context.disabled}
      readOnly={context.readOnly}
      invalid={context.invalid}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
    >
      <ArkNumberInput.Control>
        <ArkNumberInput.Label>{local.label ?? local.axis.toUpperCase()}</ArkNumberInput.Label>
        <ArkNumberInput.Input {...rest} />
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
