<script lang="ts">
  import { VectorPad } from "../../src/index.js";
</script>

<VectorPad.Root class="offset" data-testid="pad">
  <VectorPad.Control title="Drag me">
    <VectorPad.Thumb class="knob" />
  </VectorPad.Control>
  <VectorPad.Input axis="x" label="Horizontal" />
</VectorPad.Root>
