<!--
  Field at its three sizes, side by side — one size on Field.Root sizes
  every part — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Field } from "@moderno-ui/svelte";
</script>

<div class="demo-row">
  <Field.Root size="sm">
    <Field.Label>Small</Field.Label>
    <Field.Input placeholder="sm" />
  </Field.Root>
  <Field.Root size="md">
    <Field.Label>Medium</Field.Label>
    <Field.Input placeholder="md" />
  </Field.Root>
  <Field.Root size="lg">
    <Field.Label>Large</Field.Label>
    <Field.Input placeholder="lg" />
  </Field.Root>
</div>
