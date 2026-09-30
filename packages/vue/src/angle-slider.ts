import {
  computed,
  defineComponent,
  h,
  inject,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type Component,
  type DefineComponent,
  type InjectionKey,
  type InputHTMLAttributes,
  type PropType,
} from "vue";
import {
  AngleSlider as ArkAngleSlider,
  NumberInput as ArkNumberInput,
  useAngleSliderContext,
  useNumberInput,
} from "@ark-ui/vue";
import type { AngleSliderRootProps, NumberInputValueChangeDetails } from "@ark-ui/vue";
import {
  ANGLE_SLIDER_SHIFT_EVENTS,
  angleFromInput,
  angleSliderChangeDetails,
  angleSliderInputFormat,
  angleSliderPageValue,
  angleSliderRecipe,
  angleSliderValueText,
  createShiftTracker,
  isAngleOutsideTurn,
  numberInputRecipe,
  resolveAngle,
  trackInputModality,
  wrapAngle,
  type AngleSliderSize,
  type AngleSliderValueChangeDetails,
} from "@moderno-ui/core";

export type { AngleSliderSize, AngleSliderValueChangeDetails } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size`
 * recipe, the snap `marks` and the spoken value. The change callbacks are
 * the Root's own emits — it settles each value before reporting it — so a
 * `h()` caller (and a template) passes them as `onValueChange` /
 * `onValueChangeEnd` / `onUpdate:modelValue` handlers.
 */
export interface ModernoAngleSliderRootProps extends AngleSliderRootProps {
  size?: AngleSliderSize;
  marks?: number[];
  getAriaValueText?: (value: number) => string;
  onValueChange?: (details: AngleSliderValueChangeDetails) => void;
  onValueChangeEnd?: (details: AngleSliderValueChangeDetails) => void;
  "onUpdate:modelValue"?: (value: number) => void;
}

/** Props of `AngleSlider.Input`: the angle field's own `<input>`. */
export type AngleSliderInputProps = InputHTMLAttributes;

/** What the Root tells the Moderno parts: the Ark API does not carry these. */
interface AngleSliderSettings {
  readonly size?: AngleSliderSize;
  readonly step: number;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
  getAriaValueText: (value: number) => string;
  onValueChangeEnd?: (details: AngleSliderValueChangeDetails) => void;
}

const SETTINGS: InjectionKey<AngleSliderSettings> = Symbol("ModernoAngleSliderSettings");
const DEFAULT_SETTINGS: AngleSliderSettings = {
  step: 1,
  getAriaValueText: angleSliderValueText,
};

/**
 * AngleSlider.Root with the Moderno `size` recipe folded in, and the angle
 * held here rather than in Ark: every value Ark reports is wrapped into one
 * turn (a drag past 360° carries on from 0°) and, while Shift is held during
 * a press, pulled to the nearest of `marks`, before it is emitted. Ark is
 * always given the settled angle back as its `modelValue`.
 */
const AngleSliderRootImpl = defineComponent({
  name: "ModernoAngleSliderRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<AngleSliderSize>, default: undefined },
    step: { type: Number, default: 1 },
    marks: { type: Array as PropType<number[]>, default: undefined },
    modelValue: { type: Number, default: undefined },
    defaultValue: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    getAriaValueText: {
      type: Function as PropType<(value: number) => string>,
      default: angleSliderValueText,
    },
  },
  emits: ["valueChange", "valueChangeEnd", "update:modelValue"],
  setup(props, { slots, attrs, emit }) {
    const uncontrolled = ref(wrapAngle(props.defaultValue));
    const angle = computed(() =>
      props.modelValue === undefined ? uncontrolled.value : wrapAngle(props.modelValue),
    );

    // Whether Shift is held during the current pointer press.
    const shift = createShiftTracker();
    // A press focuses the thumb (Ark); the modality keeps that from drawing a focus ring.
    let stopTracking: (() => void) | undefined;
    onMounted(() => {
      stopTracking = trackInputModality();
      for (const type of ANGLE_SLIDER_SHIFT_EVENTS) {
        document.addEventListener(type, shift.track, true);
      }
    });
    onBeforeUnmount(() => {
      stopTracking?.();
      for (const type of ANGLE_SLIDER_SHIFT_EVENTS) {
        document.removeEventListener(type, shift.track, true);
      }
    });

    function settle(details: { value: number }) {
      const next = resolveAngle(details.value, {
        marks: props.marks,
        snapToMarks: shift.isHeld(),
      });
      if (next === angle.value) return;
      if (props.modelValue === undefined) uncontrolled.value = next;
      emit("valueChange", angleSliderChangeDetails(next));
      emit("update:modelValue", next);
    }

    const endChange = (details: AngleSliderValueChangeDetails) => emit("valueChangeEnd", details);

    provide(SETTINGS, {
      get size() {
        return props.size;
      },
      get step() {
        return props.step;
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
      getAriaValueText: (value) => props.getAriaValueText(value),
      onValueChangeEnd: endChange,
    });

    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union.
    const Root = ArkAngleSlider.Root as unknown as Component;
    return () =>
      h(
        Root,
        {
          ...attrs,
          ...angleSliderRecipe({ size: props.size }),
          step: props.step,
          modelValue: angle.value,
          disabled: props.disabled,
          readOnly: props.readOnly,
          invalid: props.invalid,
          onValueChange: settle,
          onValueChangeEnd: (details: { value: number }) =>
            endChange(angleSliderChangeDetails(details.value)),
        },
        slots,
      );
  },
});

/** Page Up turns the dial forward, Page Down back. */
const PAGE_KEYS: Record<string, 1 | -1> = { PageUp: 1, PageDown: -1 };

/**
 * AngleSlider.Thumb, Ark's slider handle, with two additions made through
 * the Ark API: `aria-valuetext` says the angle in degrees, and Page Up / Page
 * Down turn it by 15° (Ark's machine handles the arrows, Home and End only).
 */
const AngleSliderThumbImpl = defineComponent({
  name: "ModernoAngleSliderThumb",
  inheritAttrs: false,
  setup(_props, { slots, attrs }) {
    const angleSlider = useAngleSliderContext();
    const settings = inject(SETTINGS, DEFAULT_SETTINGS);

    function handleKeydown(event: KeyboardEvent) {
      const direction = PAGE_KEYS[event.key];
      if (event.defaultPrevented || !direction || settings.disabled || settings.readOnly) return;
      event.preventDefault();
      const next = angleSliderPageValue(angleSlider.value.value, settings.step, direction);
      angleSlider.value.setValue(next);
      settings.onValueChangeEnd?.(angleSliderChangeDetails(next));
    }

    const Thumb = ArkAngleSlider.Thumb as unknown as Component;
    return () =>
      h(
        Thumb,
        mergeProps(
          { "aria-valuetext": settings.getAriaValueText(angleSlider.value.value) },
          attrs,
          { onKeydown: handleKeydown },
        ),
        slots,
      );
  },
});

/**
 * AngleSlider.Input — the angle as a number field with a `°` after it, kept
 * in step with the dial both ways. Moderno's addition to Ark's anatomy: an
 * Ark NumberInput named by the slider's Label. What the user types sets the
 * dial at once, wrapped and snapped to the step; the text itself is left
 * alone while they type (unless it leaves one turn) and settles to the
 * dial's angle when they commit it. The field is built with
 * `useNumberInput`, the only way Ark-Vue passes `onValueCommit` through.
 */
const AngleSliderInputImpl = defineComponent({
  name: "ModernoAngleSliderInput",
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const angleSlider = useAngleSliderContext();
    const settings = inject(SETTINGS, DEFAULT_SETTINGS);
    const text = ref(String(angleSlider.value.value));
    const textAngle = ref(angleSlider.value.value);

    // The dial moved on its own: show its angle.
    watch(
      () => angleSlider.value.value,
      (value) => {
        if (value === textAngle.value) return;
        text.value = String(value);
        textAngle.value = value;
      },
    );

    function handleValueChange({ value, valueAsNumber }: NumberInputValueChangeDetails) {
      const next = angleFromInput(valueAsNumber, settings.step);
      text.value = next !== undefined && isAngleOutsideTurn(valueAsNumber) ? String(next) : value;
      if (next === undefined) return;
      textAngle.value = next;
      angleSlider.value.setValue(next);
    }

    function handleValueCommit() {
      text.value = String(angleSlider.value.value);
      textAngle.value = angleSlider.value.value;
    }

    const numberInput = useNumberInput(
      computed(() => ({
        modelValue: text.value,
        formatOptions: angleSliderInputFormat,
        disabled: settings.disabled,
        readOnly: settings.readOnly,
        invalid: settings.invalid,
        translations: { valueText: () => settings.getAriaValueText(angleSlider.value.value) },
        onValueChange: handleValueChange,
        onValueCommit: handleValueCommit,
      })),
    );

    // Ark's parts re-typed as plain Components: their prop unions are too
    // large for `h()` to check.
    const RootProvider = ArkNumberInput.RootProvider as unknown as Component;
    const Control = ArkNumberInput.Control as unknown as Component;
    const Input = ArkNumberInput.Input as unknown as Component;
    return () =>
      h(
        RootProvider,
        { value: numberInput.value, ...numberInputRecipe({ size: settings.size }) },
        () =>
          h(Control, null, () =>
            h(Input, {
              "aria-labelledby": angleSlider.value.getLabelProps().id,
              ...attrs,
            }),
          ),
      );
  },
});

/**
 * AngleSlider — a round dial to pick an angle from 0° to 359°, with a number
 * field beside it, for a gradient's direction or a rotation. 0° points up
 * and the angle grows clockwise. Ark drives the machine: the `Thumb` is a
 * `role="slider"`, a click or a drag on the `Control` sets the angle in
 * `step`s, the arrow keys step it and Home/End go to 0° and 359°; Ark rotates
 * the thumb and each `Marker` inline. `Root` and `Thumb` are wrapped (the
 * recipe, the wrap past 360°, Shift-snapping to `marks`, the spoken value
 * and Page Up / Page Down); `Input` is Moderno's; every other part is Ark's
 * verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const AngleSlider: Omit<typeof ArkAngleSlider, "Root" | "Thumb"> & {
  Root: DefineComponent<ModernoAngleSliderRootProps>;
  Thumb: typeof ArkAngleSlider.Thumb;
  Input: DefineComponent<AngleSliderInputProps>;
} = {
  ...ArkAngleSlider,
  Root: AngleSliderRootImpl as unknown as DefineComponent<ModernoAngleSliderRootProps>,
  Thumb: AngleSliderThumbImpl as unknown as typeof ArkAngleSlider.Thumb,
  Input: AngleSliderInputImpl as unknown as DefineComponent<AngleSliderInputProps>,
};

export type {
  AngleSliderRootProps,
  AngleSliderLabelProps,
  AngleSliderControlProps,
  AngleSliderThumbProps,
  AngleSliderMarkerGroupProps,
  AngleSliderMarkerProps,
  AngleSliderValueTextProps,
  AngleSliderHiddenInputProps,
} from "@ark-ui/vue";
