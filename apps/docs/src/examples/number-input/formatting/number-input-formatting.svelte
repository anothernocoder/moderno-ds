<script lang="ts">
  import { NumberInput } from "@moderno-ui/svelte";
</script>

<NumberInput.Root
  defaultValue="1250"
  step={50}
  formatOptions={{ style: "currency", currency: "USD" }}
>
  <NumberInput.Label>Price</NumberInput.Label>
  <NumberInput.Control>
    <NumberInput.Input />
    <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
    <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
  </NumberInput.Control>
</NumberInput.Root>
