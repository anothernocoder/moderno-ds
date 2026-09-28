<script lang="ts">
  import { VectorPad } from "../../src/index.js";
  import type { VectorPadRootProps } from "../../src/index.js";

  let props: VectorPadRootProps = $props();
</script>

<VectorPad.Root class="offset" {...props}>
  <VectorPad.Label>Offset</VectorPad.Label>
  <VectorPad.Control>
    <VectorPad.Grid />
    <VectorPad.Crosshair />
    <VectorPad.Thumb />
  </VectorPad.Control>
  <VectorPad.Input axis="x" />
  <VectorPad.Input axis="y" />
</VectorPad.Root>
