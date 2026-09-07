<!--
  Live PinInput preview — the real @moderno-ui/svelte primitive across its three
  sizes plus the invalid state. Hydrated as an island; painted by @moderno-ui/css
  from the active theme, so it re-skins live with the Theme Builder and the
  color-scheme toggle.

  The cells are typed and pasted into for real: Ark moves focus, distributes a
  pasted code, and flags the root complete once every cell holds a character.
-->
<script lang="ts">
  import { PinInput } from "@moderno-ui/svelte";

  const cells = [0, 1, 2, 3, 4, 5];
</script>

<div class="demo-row">
  <PinInput.Root count={cells.length} otp size="md">
    <PinInput.Label>Verification code</PinInput.Label>
    <PinInput.Control>
      {#each cells as index (index)}
        <PinInput.Input {index} />
      {/each}
    </PinInput.Control>
    <PinInput.HiddenInput />
  </PinInput.Root>
</div>

<div class="demo-row">
  <PinInput.Root count={4} size="sm" defaultValue={["1", "2", "3", "4"]}>
    <PinInput.Label>Small, complete</PinInput.Label>
    <PinInput.Control>
      {#each [0, 1, 2, 3] as index (index)}
        <PinInput.Input {index} />
      {/each}
    </PinInput.Control>
  </PinInput.Root>

  <PinInput.Root count={4} size="lg" mask>
    <PinInput.Label>Large, masked</PinInput.Label>
    <PinInput.Control>
      {#each [0, 1, 2, 3] as index (index)}
        <PinInput.Input {index} />
      {/each}
    </PinInput.Control>
  </PinInput.Root>

  <PinInput.Root count={4} invalid defaultValue={["9", "9", "9", "9"]}>
    <PinInput.Label>Invalid</PinInput.Label>
    <PinInput.Control>
      {#each [0, 1, 2, 3] as index (index)}
        <PinInput.Input {index} />
      {/each}
    </PinInput.Control>
  </PinInput.Root>
</div>
