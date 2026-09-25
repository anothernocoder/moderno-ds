<!--
  PinInput at its three sizes, side by side — size on PinInput.Root sizes
  every cell — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { PinInput } from "@moderno-ui/svelte";

  const cells = [0, 1, 2, 3];
</script>

<div class="demo-row">
  <PinInput.Root count={cells.length} size="sm">
    <PinInput.Label>Small</PinInput.Label>
    <PinInput.Control>
      {#each cells as index (index)}
        <PinInput.Input {index} />
      {/each}
    </PinInput.Control>
  </PinInput.Root>
  <PinInput.Root count={cells.length} size="md">
    <PinInput.Label>Medium</PinInput.Label>
    <PinInput.Control>
      {#each cells as index (index)}
        <PinInput.Input {index} />
      {/each}
    </PinInput.Control>
  </PinInput.Root>
  <PinInput.Root count={cells.length} size="lg">
    <PinInput.Label>Large</PinInput.Label>
    <PinInput.Control>
      {#each cells as index (index)}
        <PinInput.Input {index} />
      {/each}
    </PinInput.Control>
  </PinInput.Root>
</div>
