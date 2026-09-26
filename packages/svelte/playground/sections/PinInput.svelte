<!--
  PinInput — n cells whose ids and aria labels are derived from the root id
  and `count`, so the server must know the cell count too.
-->
<script lang="ts">
  import { PinInput } from "../../src/exports/pin-input.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();

  // A six-digit one-time code: the cell indices the PinInput renders. `count` on
  // the Root tells Ark the same number so the server-rendered aria labels match.
  const codeCells = [0, 1, 2, 3, 4, 5];
</script>

<section aria-label="pin-input">
  <PinInput.Root count={codeCells.length} otp size="md">
    <PinInput.Label>Verification code</PinInput.Label>
    <PinInput.Control>
      {#each codeCells as index (index)}
        <PinInput.Input {index} />
      {/each}
    </PinInput.Control>
    <PinInput.HiddenInput />
  </PinInput.Root>
</section>
