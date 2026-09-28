<script lang="ts">
  import { VectorPad } from "@moderno-ui/svelte";
</script>

<div class="demo-row">
  <VectorPad.Root size="sm">
    <VectorPad.Label>Small</VectorPad.Label>
    <VectorPad.Control>
      <VectorPad.Thumb />
    </VectorPad.Control>
    <VectorPad.Input axis="x" />
    <VectorPad.Input axis="y" />
  </VectorPad.Root>
  <VectorPad.Root size="md">
    <VectorPad.Label>Medium</VectorPad.Label>
    <VectorPad.Control>
      <VectorPad.Thumb />
    </VectorPad.Control>
    <VectorPad.Input axis="x" />
    <VectorPad.Input axis="y" />
  </VectorPad.Root>
  <VectorPad.Root size="lg">
    <VectorPad.Label>Large</VectorPad.Label>
    <VectorPad.Control>
      <VectorPad.Thumb />
    </VectorPad.Control>
    <VectorPad.Input axis="x" />
    <VectorPad.Input axis="y" />
  </VectorPad.Root>
</div>
