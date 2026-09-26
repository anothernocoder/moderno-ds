import { splitProps } from "solid-js";
import { Slider as ArkSlider } from "@ark-ui/solid";
import type { SliderRootProps } from "@ark-ui/solid";
import { sliderRecipe, type SliderSize } from "@moderno-ui/core";

export type { SliderSize } from "@moderno-ui/core";

export type ModernoSliderRootProps = SliderRootProps & {
  /** Track thickness, thumb size and type — resolves to `data-size` on the root part. */
  size?: SliderSize;
};

/**
 * Slider.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` sizes the parts from it.
 */
function SliderRoot(props: ModernoSliderRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkSlider.Root {...rest} {...sliderRecipe({ size: local.size })} />;
}

/**
 * Slider — pick a number, or a range between two, by dragging a thumb along
 * a track. Ark drives all of it: each `Thumb` is a `role="slider"` with
 * `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, moved by pointer or
 * keyboard; the `value` array holds one number per thumb, so two values make
 * a range; Ark places the thumbs, the `Range` and each `Marker` inline.
 * `Root` is wrapped to inject the recipe; every other part is Ark's verbatim.
 * The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Slider: Omit<typeof ArkSlider, "Root"> & { Root: typeof SliderRoot } = {
  ...ArkSlider,
  Root: SliderRoot,
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
} from "@ark-ui/solid";
