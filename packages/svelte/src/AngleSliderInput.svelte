<!--
  AngleSlider.Input — the angle as a number field with a `°` after it, kept
  in step with the dial both ways. Moderno's addition to Ark's anatomy: an
  Ark NumberInput named by the slider's Label. What the user types sets the
  dial at once, wrapped and snapped to the step; the text itself is left
  alone while they type (unless it leaves one turn) and settles to the
  dial's angle when they commit it.

  The field is built with `useNumberInput` and handed to Ark's RootProvider,
  so the text is always the one set here: Ark's own Root would keep what the
  user typed as a local override of `value`.
-->
<script lang="ts">
  import {
    NumberInput as ArkNumberInput,
    useAngleSliderContext,
    useNumberInput,
  } from "@ark-ui/svelte";
  import type { NumberInputValueChangeDetails } from "@ark-ui/svelte";
  import {
    angleFromInput,
    angleSliderInputFormat,
    isAngleOutsideTurn,
    numberInputRecipe,
  } from "@moderno-ui/core";
  import { getAngleSliderSettings, type AngleSliderInputProps } from "./angle-slider-props.js";

  let props: AngleSliderInputProps = $props();
  const providedId = $props.id();
  const angleSlider = useAngleSliderContext();
  const settings = getAngleSliderSettings();

  let text = $state(String(angleSlider().value));
  let textAngle = $state(angleSlider().value);

  // The dial moved on its own: show its angle.
  $effect.pre(() => {
    const value = angleSlider().value;
    if (value === textAngle) return;
    text = String(value);
    textAngle = value;
  });

  function handleValueChange({ value, valueAsNumber }: NumberInputValueChangeDetails) {
    const next = angleFromInput(valueAsNumber, settings.step);
    text = next !== undefined && isAngleOutsideTurn(valueAsNumber) ? String(next) : value;
    if (next === undefined) return;
    textAngle = next;
    angleSlider().setValue(next);
  }

  function handleValueCommit() {
    text = String(angleSlider().value);
    textAngle = angleSlider().value;
  }

  const numberInput = useNumberInput(() => ({
    id: providedId,
    value: text,
    formatOptions: angleSliderInputFormat,
    disabled: settings.disabled,
    readOnly: settings.readOnly,
    invalid: settings.invalid,
    translations: { valueText: () => settings.getAriaValueText(angleSlider().value) },
    onValueChange: handleValueChange,
    onValueCommit: handleValueCommit,
  }));
</script>

<ArkNumberInput.RootProvider value={numberInput} {...numberInputRecipe({ size: settings.size })}>
  <ArkNumberInput.Control>
    <ArkNumberInput.Input aria-labelledby={angleSlider().getLabelProps().id} {...props} />
  </ArkNumberInput.Control>
</ArkNumberInput.RootProvider>
