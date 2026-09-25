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
