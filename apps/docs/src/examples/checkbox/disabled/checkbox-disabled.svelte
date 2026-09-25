<!--
  A disabled, checked Checkbox — inert, and dimmed across every part —
  @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Checkbox } from "@moderno-ui/svelte";
</script>

<Checkbox.Root disabled defaultChecked>
  <Checkbox.Control>
    <Checkbox.Indicator>✓</Checkbox.Indicator>
  </Checkbox.Control>
  <Checkbox.Label>Share usage analytics</Checkbox.Label>
  <Checkbox.HiddenInput />
</Checkbox.Root>
