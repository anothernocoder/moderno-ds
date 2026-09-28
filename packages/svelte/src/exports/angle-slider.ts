import { AngleSlider as ArkAngleSlider } from "@ark-ui/svelte";
import AngleSliderRoot from "../AngleSliderRoot.svelte";
import AngleSliderThumb from "../AngleSliderThumb.svelte";
import AngleSliderInput from "../AngleSliderInput.svelte";

/**
 * AngleSlider — a round dial to pick an angle from 0° to 359°, with a number
 * field beside it, for a gradient's direction or a rotation. 0° points up
 * and the angle grows clockwise. Ark renders the `Thumb` as a
 * `role="slider"`; a click or a drag on the `Control` sets the angle in
 * `step`s, the arrow keys step it and Home/End go to 0° and 359°; Ark rotates
 * the thumb and each `Marker` inline. `Root` and `Thumb` are wrapped (the
 * recipe, the wrap past 360°, Shift-snapping to `marks`, the spoken value
 * and Page Up / Page Down); `Input` is Moderno's; every other part is Ark's
 * verbatim. Annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const AngleSlider: Omit<typeof ArkAngleSlider, "Root" | "Thumb"> & {
  Root: typeof AngleSliderRoot;
  Thumb: typeof AngleSliderThumb;
  Input: typeof AngleSliderInput;
} = {
  ...ArkAngleSlider,
  Root: AngleSliderRoot,
  Thumb: AngleSliderThumb,
  Input: AngleSliderInput,
};
export type { AngleSliderSize, AngleSliderValueChangeDetails } from "@moderno-ui/core";
export type { ModernoAngleSliderRootProps, AngleSliderInputProps } from "../angle-slider-props.js";
