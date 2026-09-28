import {
  computed,
  defineComponent,
  h,
  inject,
  mergeProps,
  provide,
  ref,
  useId,
  watch,
  type Component,
  type ComputedRef,
  type DefineComponent,
  type HTMLAttributes,
  type InjectionKey,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type PropType,
} from "vue";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { NumberInput as ArkNumberInput, useNumberInput } from "@ark-ui/vue";
import type { NumberInputValueChangeDetails } from "@ark-ui/vue";
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

/**
 * `VectorPad.Root`: the machine's props and the `size` recipe. The value is
 * `modelValue` (`v-model`), and the change callbacks are the Root's emits, so
 * a `h()` caller passes them as `onValueChange` / `onValueChangeEnd` /
 * `onUpdate:modelValue` handlers.
 */
export interface VectorPadRootProps extends Omit<
  vectorPad.Props,
  "id" | "value" | "onValueChange" | "onValueChangeEnd"
> {
  /** The machine's id, which every part's id starts from. Generated when omitted. */
  id?: string;
  /** Pad side, field height and type — resolves to `data-size` on the root part. */
  size?: VectorPadSize;
  /** The controlled value; bind it with `v-model`. */
  modelValue?: VectorPadValue;
  onValueChange?: (details: VectorPadValueChangeDetails) => void;
  onValueChangeEnd?: (details: VectorPadValueChangeDetails) => void;
  "onUpdate:modelValue"?: (value: VectorPadValue) => void;
}

/** `VectorPad.Input`: one axis as a number field; its other attributes go on the `<input>`. */
export interface VectorPadInputProps extends InputHTMLAttributes {
  /** The axis this field shows and sets. */
  axis: VectorPadAxis;
  /** The field's visible name. Defaults to `"X"` or `"Y"`. */
  label?: string;
}

/** What the Root tells its parts: the connected machine and what the fields need. */
interface VectorPadContext {
  api: ComputedRef<vectorPad.Api>;
  readonly size?: VectorPadSize;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly invalid: boolean;
}

const CONTEXT: InjectionKey<VectorPadContext> = Symbol("ModernoVectorPad");

function useVectorPadContext(): VectorPadContext {
  const context = inject(CONTEXT, null);
  if (!context) throw new Error("VectorPad parts must be inside VectorPad.Root.");
  return context;
}

/** A `min`, `max` or `step` prop: one number for both axes, or one per axis. */
const axisSettingProp = {
  type: [Number, Object] as PropType<vectorPad.AxisSetting>,
  default: undefined,
};

/** VectorPad.Root: runs the machine and holds the pad, the label and the fields. */
const VectorPadRootImpl = defineComponent({
  name: "ModernoVectorPadRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<VectorPadSize>, default: undefined },
    modelValue: { type: Object as PropType<VectorPadValue>, default: undefined },
    defaultValue: { type: Object as PropType<VectorPadValue>, default: undefined },
    min: axisSettingProp,
    max: axisSettingProp,
    step: axisSettingProp,
    invertY: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    getAriaValueText: {
      type: Function as PropType<(value: VectorPadValue) => string>,
      default: undefined,
    },
    id: { type: String, default: undefined },
    ids: { type: Object as PropType<vectorPad.ElementIds>, default: undefined },
    dir: { type: String as PropType<"ltr" | "rtl">, default: undefined },
    getRootNode: {
      type: Function as PropType<vectorPad.Props["getRootNode"]>,
      default: undefined,
    },
  },
  emits: ["valueChange", "valueChangeEnd", "update:modelValue"],
  setup(props, { slots, attrs, emit }) {
    const generatedId = useId();
    const service = useMachine(
      vectorPad.machine,
      computed(() => ({
        id: props.id ?? generatedId,
        ids: props.ids,
        dir: props.dir,
        getRootNode: props.getRootNode,
        value: props.modelValue,
        defaultValue: props.defaultValue,
        min: props.min,
        max: props.max,
        step: props.step,
        invertY: props.invertY,
        disabled: props.disabled,
        readOnly: props.readOnly,
        invalid: props.invalid,
        getAriaValueText: props.getAriaValueText,
        "aria-label": attrs["aria-label"] as string | undefined,
        "aria-labelledby": attrs["aria-labelledby"] as string | undefined,
        onValueChange(details: VectorPadValueChangeDetails) {
          emit("valueChange", details);
          emit("update:modelValue", details.value);
        },
        onValueChangeEnd: (details: VectorPadValueChangeDetails) => emit("valueChangeEnd", details),
      })),
    );
    const api = computed(() => vectorPad.connect(service, normalizeProps));

    provide(CONTEXT, {
      api,
      get size() {
        return props.size;
      },
      get disabled() {
        return props.disabled;
      },
      get readOnly() {
        return props.readOnly;
      },
      get invalid() {
        return props.invalid;
      },
    });

    return () =>
      h(
        "div",
        mergeProps(
          api.value.getRootProps() as Record<string, unknown>,
          vectorPadRecipe({ size: props.size }),
          attrs,
        ),
        slots.default?.(),
      );
  },
});

/** One part of the pad: its element, with the machine's props for it merged under the caller's. */
function definePart(
  name: string,
  tag: string,
  getProps: (api: vectorPad.Api) => Record<string, unknown>,
) {
  return defineComponent({
    name: `ModernoVectorPad${name}`,
    inheritAttrs: false,
    setup(_props, { slots, attrs }) {
      const { api } = useVectorPadContext();
      return () => h(tag, mergeProps(getProps(api.value), attrs), slots.default?.());
    },
  });
}

const VectorPadLabelImpl = definePart("Label", "label", (api) => api.getLabelProps());
const VectorPadControlImpl = definePart("Control", "div", (api) => api.getControlProps());
const VectorPadGridImpl = definePart("Grid", "div", (api) => api.getGridProps());
const VectorPadCrosshairImpl = definePart("Crosshair", "div", (api) => api.getCrosshairProps());
const VectorPadThumbImpl = definePart("Thumb", "div", (api) => api.getThumbProps());

/**
 * VectorPad.Input — one axis as an Ark NumberInput, kept in step with the
 * handle both ways. What the user types moves the handle at once, kept in
 * the range and on the step; the text itself is left alone while they type
 * and settles to the handle's value when they commit it (blur or Enter),
 * which also ends the change the field made (`onValueChangeEnd`).
 * The field is built with `useNumberInput`, the only way Ark-Vue passes
 * `onValueCommit` through.
 */
const VectorPadInputImpl = defineComponent({
  name: "ModernoVectorPadInput",
  inheritAttrs: false,
  props: {
    axis: { type: String as PropType<VectorPadAxis>, required: true },
    label: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const context = useVectorPadContext();
    const axisValue = computed(() => context.api.value.value[props.axis]);
    const text = ref(String(axisValue.value));
    const textValue = ref(axisValue.value);

    // The handle moved on its own: show its value.
    watch(axisValue, (value) => {
      if (value === textValue.value) return;
      text.value = String(value);
      textValue.value = value;
    });

    function handleValueChange({ value, valueAsNumber }: NumberInputValueChangeDetails) {
      text.value = value;
      if (Number.isNaN(valueAsNumber)) return;
      const next = vectorPad.snapAxisValue(valueAsNumber, props.axis, context.api.value.bounds);
      textValue.value = next;
      context.api.value.setAxisValue(props.axis, next);
    }

    function handleValueCommit() {
      text.value = String(axisValue.value);
      textValue.value = axisValue.value;
      context.api.value.endChange();
    }

    const numberInput = useNumberInput(
      computed(() => {
        const { bounds } = context.api.value;
        return {
          modelValue: text.value,
          min: bounds.min[props.axis],
          max: bounds.max[props.axis],
          step: bounds.step[props.axis],
          disabled: context.disabled,
          readOnly: context.readOnly,
          invalid: context.invalid,
          onValueChange: handleValueChange,
          onValueCommit: handleValueCommit,
        };
      }),
    );

    // Ark's parts re-typed as plain Components: their prop unions are too
    // large for `h()` to check.
    const RootProvider = ArkNumberInput.RootProvider as unknown as Component;
    const Control = ArkNumberInput.Control as unknown as Component;
    const Label = ArkNumberInput.Label as unknown as Component;
    const Input = ArkNumberInput.Input as unknown as Component;
    return () =>
      h(
        RootProvider,
        {
          value: numberInput.value,
          ...numberInputRecipe({ size: context.size }),
          "data-axis": props.axis,
        },
        () =>
          h(Control, null, () => [
            h(Label, null, () => props.label ?? props.axis.toUpperCase()),
            h(Input, attrs),
          ]),
      );
  },
});

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
  Root: DefineComponent<VectorPadRootProps>;
  Label: DefineComponent<LabelHTMLAttributes>;
  Control: DefineComponent<HTMLAttributes>;
  Grid: DefineComponent<HTMLAttributes>;
  Crosshair: DefineComponent<HTMLAttributes>;
  Thumb: DefineComponent<HTMLAttributes>;
  Input: DefineComponent<VectorPadInputProps>;
} = {
  Root: VectorPadRootImpl as unknown as DefineComponent<VectorPadRootProps>,
  Label: VectorPadLabelImpl as unknown as DefineComponent<LabelHTMLAttributes>,
  Control: VectorPadControlImpl as unknown as DefineComponent<HTMLAttributes>,
  Grid: VectorPadGridImpl as unknown as DefineComponent<HTMLAttributes>,
  Crosshair: VectorPadCrosshairImpl as unknown as DefineComponent<HTMLAttributes>,
  Thumb: VectorPadThumbImpl as unknown as DefineComponent<HTMLAttributes>,
  Input: VectorPadInputImpl as unknown as DefineComponent<VectorPadInputProps>,
};
