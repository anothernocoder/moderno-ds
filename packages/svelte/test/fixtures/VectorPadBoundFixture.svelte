<script lang="ts">
  import { VectorPad } from "../../src/index.js";
  import type { VectorPadValue } from "../../src/index.js";

  let { start }: { start?: VectorPadValue } = $props();
  // Starts unset unless given a value: bind:value must learn it either way.
  // svelte-ignore state_referenced_locally
  let offset = $state<VectorPadValue | undefined>(start);
</script>

<VectorPad.Root bind:value={offset}>
  <VectorPad.Control>
    <VectorPad.Thumb />
  </VectorPad.Control>
</VectorPad.Root>
<output>{offset ? `${offset.x},${offset.y}` : "unset"}</output>
<button type="button" onclick={() => (offset = { x: -5, y: 6 })}>Move</button>
