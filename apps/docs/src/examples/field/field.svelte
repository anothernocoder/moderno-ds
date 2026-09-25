<!--
  A labelled input with helper text, at the default size — @moderno-
  ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Field } from "@moderno-ui/svelte";
</script>

<Field.Root>
  <Field.Label>Email</Field.Label>
  <Field.Input type="email" placeholder="you@example.com" />
  <Field.HelperText>We only use it to send receipts.</Field.HelperText>
</Field.Root>
