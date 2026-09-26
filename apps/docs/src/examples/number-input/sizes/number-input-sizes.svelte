<script lang="ts">
  import { NumberInput } from "@moderno-ui/svelte";
</script>

<div class="demo-stack">
  <NumberInput.Root size="sm" defaultValue="1">
    <NumberInput.Label>Small</NumberInput.Label>
    <NumberInput.Control>
      <NumberInput.Input />
      <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
      <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
  <NumberInput.Root size="md" defaultValue="2">
    <NumberInput.Label>Medium</NumberInput.Label>
    <NumberInput.Control>
      <NumberInput.Input />
      <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
      <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
  <NumberInput.Root size="lg" defaultValue="3">
    <NumberInput.Label>Large</NumberInput.Label>
    <NumberInput.Control>
      <NumberInput.Input />
      <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
      <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
</div>
