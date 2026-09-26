import { Slider as ArkSlider } from "@ark-ui/svelte";
import SliderRoot from "../SliderRoot.svelte";

/**
 * Slider — pick a number, or a range between two, by dragging a thumb along
 * a track. Ark renders each `Thumb` as a `role="slider"` with
 * `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, moved by pointer or
 * keyboard; the `value` array holds one number per thumb, so two values make
 * a range; Ark places the thumbs, the `Range` and each `Marker` inline.
 * `Root` is wrapped to inject the `size` recipe; every other part is Ark's
 * verbatim. Annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const Slider: Omit<typeof ArkSlider, "Root"> & { Root: typeof SliderRoot } = {
  ...ArkSlider,
  Root: SliderRoot,
};
export type { SliderSize } from "@moderno-ui/core";
export type { SliderValueChangeDetails, SliderFocusChangeDetails } from "@ark-ui/svelte";
