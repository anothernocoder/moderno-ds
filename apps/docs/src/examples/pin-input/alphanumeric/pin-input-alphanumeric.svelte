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
