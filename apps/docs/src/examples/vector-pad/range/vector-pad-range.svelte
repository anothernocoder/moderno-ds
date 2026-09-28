<script lang="ts">
  import { VectorPad } from "@moderno-ui/svelte";
</script>

<VectorPad.Root min={0} max={{ x: 200, y: 100 }} step={10} defaultValue={{ x: 100, y: 50 }}>
  <VectorPad.Label>Scale</VectorPad.Label>
  <VectorPad.Control>
    <VectorPad.Thumb />
  </VectorPad.Control>
  <VectorPad.Input axis="x" />
  <VectorPad.Input axis="y" />
</VectorPad.Root>
