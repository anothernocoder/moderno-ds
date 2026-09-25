<!--
  An alphanumeric PinInput — letters and digits are both accepted, and the
  cells use a text keyboard — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { PinInput } from "@moderno-ui/svelte";

  const cells = [0, 1, 2, 3, 4, 5];
</script>

<PinInput.Root count={cells.length} type="alphanumeric">
  <PinInput.Label>Recovery code</PinInput.Label>
  <PinInput.Control>
    {#each cells as index (index)}
      <PinInput.Input {index} />
    {/each}
  </PinInput.Control>
</PinInput.Root>
