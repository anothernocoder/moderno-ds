<!--
  Filled cells tint toward the primary colour; once every cell holds a
  character the whole code turns primary — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { PinInput } from "@moderno-ui/svelte";

  const cells = [0, 1, 2, 3];
</script>

<div class="demo-row">
  <PinInput.Root count={cells.length} defaultValue={["4", "2"]}>
    <PinInput.Label>Partly filled</PinInput.Label>
    <PinInput.Control>
      {#each cells as index (index)}
        <PinInput.Input {index} />
      {/each}
    </PinInput.Control>
  </PinInput.Root>
  <PinInput.Root count={cells.length} defaultValue={["4", "2", "1", "7"]}>
    <PinInput.Label>Complete</PinInput.Label>
    <PinInput.Control>
      {#each cells as index (index)}
        <PinInput.Input {index} />
      {/each}
    </PinInput.Control>
  </PinInput.Root>
</div>
