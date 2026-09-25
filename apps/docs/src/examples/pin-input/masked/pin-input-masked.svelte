<!--
  A masked PinInput — the cells render as password inputs — @moderno-
  ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { PinInput } from "@moderno-ui/svelte";

  const cells = [0, 1, 2, 3];
</script>

<PinInput.Root count={cells.length} mask defaultValue={["7", "3"]}>
  <PinInput.Label>PIN</PinInput.Label>
  <PinInput.Control>
    {#each cells as index (index)}
      <PinInput.Input {index} />
    {/each}
  </PinInput.Control>
</PinInput.Root>
