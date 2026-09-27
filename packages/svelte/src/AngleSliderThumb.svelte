<!--
  AngleSlider.Thumb, Ark's slider handle, with two additions made through
  the Ark API: `aria-valuetext` says the angle in degrees, and Page Up / Page
  Down turn it by 15° (Ark's machine handles the arrows, Home and End only).
-->
<script lang="ts">
  import { AngleSlider as ArkAngleSlider, useAngleSliderContext } from "@ark-ui/svelte";
  import type { AngleSliderThumbProps } from "@ark-ui/svelte";
  import { angleSliderChangeDetails, angleSliderPageValue } from "@moderno-ui/core";
  import { getAngleSliderSettings } from "./angle-slider-props.js";

  let { onkeydown, ...rest }: AngleSliderThumbProps = $props();
  const angleSlider = useAngleSliderContext();
  const settings = getAngleSliderSettings();

  /** Page Up turns the dial forward, Page Down back. */
  const PAGE_KEYS: Record<string, 1 | -1> = { PageUp: 1, PageDown: -1 };

  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onkeydown?.(event);
    const direction = PAGE_KEYS[event.key];
    if (event.defaultPrevented || !direction || settings.disabled || settings.readOnly) return;
    event.preventDefault();
    const next = angleSliderPageValue(angleSlider().value, settings.step, direction);
    angleSlider().setValue(next);
    settings.onValueChangeEnd?.(angleSliderChangeDetails(next));
  }
</script>

<ArkAngleSlider.Thumb
  aria-valuetext={settings.getAriaValueText(angleSlider().value)}
  {...rest}
  onkeydown={handleKeydown}
/>
