<!--
  AngleSlider.Root with the Moderno `size` recipe folded in, and the angle
  held here rather than in Ark: every value Ark reports is wrapped into one
  turn (a drag past 360° carries on from 0°) and, while Shift is held during
  a press, pulled to the nearest of `marks`, before the consumer sees it.

  The machine is built with `useAngleSlider` and handed to Ark's
  RootProvider, so Ark is always given the settled angle back: Ark's own
  Root would keep the value it reported as a local override of `value`
  whenever the settled angle equals the last one, and show an angle the
  consumer was never told about.
-->
<script lang="ts">
  import { untrack } from "svelte";
  import { AngleSlider as ArkAngleSlider, useAngleSlider } from "@ark-ui/svelte";
  import {
    ANGLE_SLIDER_SHIFT_EVENTS,
    angleSliderChangeDetails,
    angleSliderRecipe,
    angleSliderValueText,
    createShiftTracker,
    resolveAngle,
    trackInputModality,
    wrapAngle,
  } from "@moderno-ui/core";
  import { setAngleSliderSettings, type ModernoAngleSliderRootProps } from "./angle-slider-props.js";

  let {
    size,
    value = $bindable(),
    defaultValue = 0,
    step = 1,
    marks,
    disabled,
    readOnly,
    invalid,
    id,
    ids,
    name,
    getAriaValueText = angleSliderValueText,
    onValueChange,
    onValueChangeEnd,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  }: ModernoAngleSliderRootProps = $props();
  const providedId = $props.id();

  // `defaultValue` is read once, at mount, as its name says.
  let uncontrolled = $state(untrack(() => wrapAngle(defaultValue)));
  const angle = $derived(value === undefined ? uncontrolled : wrapAngle(value));

  // Whether Shift is held during the current pointer press.
  const shift = createShiftTracker();
  $effect(() => {
    for (const type of ANGLE_SLIDER_SHIFT_EVENTS) {
      document.addEventListener(type, shift.track, true);
    }
    return () => {
      for (const type of ANGLE_SLIDER_SHIFT_EVENTS) {
        document.removeEventListener(type, shift.track, true);
      }
    };
  });

  // A press focuses the thumb (Ark); the modality keeps that from drawing a focus ring.
  $effect(trackInputModality);

  function settle(details: { value: number }) {
    const next = resolveAngle(details.value, { marks, snapToMarks: shift.isHeld() });
    if (next === angle) return;
    if (value === undefined) uncontrolled = next;
    else value = next;
    onValueChange?.(angleSliderChangeDetails(next));
  }

  setAngleSliderSettings({
    get size() {
      return size;
    },
    get step() {
      return step;
    },
    get disabled() {
      return disabled;
    },
    get readOnly() {
      return readOnly;
    },
    get invalid() {
      return invalid;
    },
    getAriaValueText: (angle) => getAriaValueText(angle),
    onValueChangeEnd: (details) => onValueChangeEnd?.(details),
  });

  const angleSlider = useAngleSlider(() => ({
    id: id ?? providedId,
    ids,
    name,
    step,
    value: angle,
    disabled,
    readOnly,
    invalid,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    onValueChange: settle,
    onValueChangeEnd: (details) => onValueChangeEnd?.(angleSliderChangeDetails(details.value)),
  }));
</script>

<ArkAngleSlider.RootProvider {...rest} {...angleSliderRecipe({ size })} value={angleSlider} />
