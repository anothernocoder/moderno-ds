<!--
  An invalid Checkbox — the box border re-colours from --destructive —
  @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Checkbox } from "@moderno-ui/svelte";
</script>

<Checkbox.Root invalid>
  <Checkbox.Control>
    <Checkbox.Indicator>✓</Checkbox.Indicator>
  </Checkbox.Control>
  <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
  <Checkbox.HiddenInput />
</Checkbox.Root>
