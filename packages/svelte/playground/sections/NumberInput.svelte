<!--
  NumberInput — Ark's number-input machine: the spinbutton's value, bounds,
  formatted text and ids, and a stepper disabled at its bound reach the
  server string.
-->
<script lang="ts">
  import { NumberInput } from "../../src/exports/number-input.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="number-input">
  <NumberInput.Root defaultValue="10" min={0} max={10}>
    <NumberInput.Label>Quantity</NumberInput.Label>
    <NumberInput.Control>
      <NumberInput.Input />
      <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
      <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
  <NumberInput.Root
    size="sm"
    defaultValue="1234.5"
    formatOptions={{ style: "currency", currency: "USD" }}
  >
    <NumberInput.Label>Price</NumberInput.Label>
    <NumberInput.Control>
      <NumberInput.Input />
      <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
      <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
</section>
