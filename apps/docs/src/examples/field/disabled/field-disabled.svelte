<!--
  A disabled Field — every part dims, the control is inert — @moderno-
  ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Field } from "@moderno-ui/svelte";
</script>

<Field.Root disabled>
  <Field.Label>Plan</Field.Label>
  <Field.Input value="Enterprise" />
  <Field.HelperText>Managed by your administrator.</Field.HelperText>
</Field.Root>
