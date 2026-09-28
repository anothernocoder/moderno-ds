<script lang="ts">
  import { VectorPad } from "@moderno-ui/svelte";
</script>

<VectorPad.Root>
  <VectorPad.Label>Light direction</VectorPad.Label>
  <VectorPad.Control>
    <VectorPad.Grid />
    <VectorPad.Crosshair />
    <VectorPad.Thumb />
  </VectorPad.Control>
  <VectorPad.Input axis="x" />
  <VectorPad.Input axis="y" />
</VectorPad.Root>
