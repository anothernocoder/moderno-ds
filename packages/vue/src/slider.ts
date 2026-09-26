import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { Slider as ArkSlider } from "@ark-ui/vue";
import type {
  SliderRootProps,
  SliderValueChangeDetails,
  SliderFocusChangeDetails,
} from "@ark-ui/vue";
import { sliderRecipe, type SliderSize } from "@moderno-ui/core";

export type { SliderSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the change callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onValueChange` / `onUpdate:modelValue` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoSliderRootProps extends SliderRootProps {
  size?: SliderSize;
  onValueChange?: (details: SliderValueChangeDetails) => void;
  onValueChangeEnd?: (details: SliderValueChangeDetails) => void;
  onFocusChange?: (details: SliderFocusChangeDetails) => void;
  "onUpdate:modelValue"?: (value: number[]) => void;
}

/**
 * Slider.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` sizes the parts from it.
 * `defaultValue`, `modelValue`, `min`, `max`, `step`, `orientation`, … pass
 * straight through via attrs.
 */
const SliderRootImpl = defineComponent({
  name: "ModernoSliderRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<SliderSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkSlider.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...sliderRecipe({ size: props.size }) }, slots);
  },
});

/**
 * Slider — pick a number, or a range between two, by dragging a thumb along
 * a track. Ark drives all of it: each `Thumb` is a `role="slider"` with
 * `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, moved by pointer or
 * keyboard; the value array holds one number per thumb, so two values make a
 * range; Ark places the thumbs, the `Range` and each `Marker` inline. `Root`
 * is wrapped to inject the recipe; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Slider: Omit<typeof ArkSlider, "Root"> & {
  Root: DefineComponent<ModernoSliderRootProps>;
} = {
  ...ArkSlider,
  Root: SliderRootImpl as unknown as DefineComponent<ModernoSliderRootProps>,
};

export type {
  SliderRootProps,
  SliderLabelProps,
  SliderValueTextProps,
  SliderControlProps,
  SliderTrackProps,
  SliderRangeProps,
  SliderThumbProps,
  SliderHiddenInputProps,
  SliderMarkerGroupProps,
  SliderMarkerProps,
  SliderDraggingIndicatorProps,
  SliderValueChangeDetails,
  SliderFocusChangeDetails,
} from "@ark-ui/vue";
