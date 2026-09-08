<script lang="ts">
  import { PinInput } from "../../src/index.js";
  import type { PinInputValueChangeDetails } from "../../src/index.js";

  let {
    invalid = false,
    mask = false,
    onValueChange,
    onValueComplete,
  }: {
    invalid?: boolean;
    mask?: boolean;
    onValueChange?: (details: PinInputValueChangeDetails) => void;
    onValueComplete?: (details: PinInputValueChangeDetails) => void;
  } = $props();

  const cells = [0, 1, 2, 3];
</script>

<PinInput.Root
  count={cells.length}
  size="sm"
  otp
  {invalid}
  {mask}
  {onValueChange}
  {onValueComplete}
>
  <PinInput.Label>Verification code</PinInput.Label>
  <PinInput.Control>
    {#each cells as index (index)}
      <PinInput.Input {index} />
    {/each}
  </PinInput.Control>
  <PinInput.HiddenInput />
</PinInput.Root>
