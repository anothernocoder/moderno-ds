<script lang="ts">
  import { NumberInput } from "@moderno-ui/svelte";
</script>

<NumberInput.Root defaultValue="8" min={1} max={8}>
  <NumberInput.Label>Guests</NumberInput.Label>
  <NumberInput.Control>
    <NumberInput.Input />
    <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
    <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
  </NumberInput.Control>
</NumberInput.Root>
