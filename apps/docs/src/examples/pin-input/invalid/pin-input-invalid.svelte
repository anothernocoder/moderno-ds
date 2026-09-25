<script lang="ts">
  import { PinInput } from "@moderno-ui/svelte";

  const cells = [0, 1, 2, 3];
</script>

<PinInput.Root count={cells.length} invalid defaultValue={["9", "9", "9", "9"]}>
  <PinInput.Label>Verification code</PinInput.Label>
  <PinInput.Control>
    {#each cells as index (index)}
      <PinInput.Input {index} />
    {/each}
  </PinInput.Control>
</PinInput.Root>
