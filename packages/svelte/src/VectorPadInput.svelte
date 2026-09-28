<!--
  VectorPad.Input — one axis as an Ark NumberInput, kept in step with the
  handle both ways. What the user types moves the handle at once, kept in the
  range and on the step; the text itself is left alone while they type and
  settles to the handle's value when they commit it (blur or Enter),
  which also ends the change the field made (`onValueChangeEnd`).

  The field is built with `useNumberInput` and handed to Ark's RootProvider,
  so the text is always the one set here: Ark's own Root would keep what the
  user typed as a local override of `value`.
-->
<script lang="ts">
  import { untrack } from "svelte";
  import { NumberInput as ArkNumberInput, useNumberInput } from "@ark-ui/svelte";
  import type { NumberInputValueChangeDetails } from "@ark-ui/svelte";
  import { numberInputRecipe, vectorPad } from "@moderno-ui/core";
  import { getVectorPadContext, type VectorPadInputProps } from "./vector-pad-props.js";

  let { axis, label, ...rest }: VectorPadInputProps = $props();
  const providedId = $props.id();
  const context = getVectorPadContext();

  const axisValue = $derived(context.api.value[axis]);
  const bounds = $derived(context.api.bounds);
  // Both start from the handle, once, at mount; the effect below keeps them in step.
  let text = $state(untrack(() => String(axisValue)));
  let textValue = $state(untrack(() => axisValue));

  // The handle moved on its own: show its value.
  $effect.pre(() => {
    const value = axisValue;
    if (value === textValue) return;
    text = String(value);
    textValue = value;
  });

  function handleValueChange({ value, valueAsNumber }: NumberInputValueChangeDetails) {
    text = value;
    if (Number.isNaN(valueAsNumber)) return;
    const next = vectorPad.snapAxisValue(valueAsNumber, axis, bounds);
    textValue = next;
    context.api.setAxisValue(axis, next);
  }

  function handleValueCommit() {
    text = String(axisValue);
    textValue = axisValue;
    context.api.endChange();
  }

  const numberInput = useNumberInput(() => ({
    id: providedId,
    value: text,
    min: bounds.min[axis],
    max: bounds.max[axis],
    step: bounds.step[axis],
    disabled: context.disabled,
    readOnly: context.readOnly,
    invalid: context.invalid,
    onValueChange: handleValueChange,
    onValueCommit: handleValueCommit,
  }));
</script>

<ArkNumberInput.RootProvider
  value={numberInput}
  {...numberInputRecipe({ size: context.size })}
  data-axis={axis}
>
  <ArkNumberInput.Control>
    <ArkNumberInput.Label>{label ?? axis.toUpperCase()}</ArkNumberInput.Label>
    <ArkNumberInput.Input {...rest} />
  </ArkNumberInput.Control>
</ArkNumberInput.RootProvider>
