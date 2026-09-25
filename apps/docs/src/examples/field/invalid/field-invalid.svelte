<!--
  An invalid Field — the error text replaces the helper and is announced —
  @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Field } from "@moderno-ui/svelte";
</script>

<Field.Root invalid>
  <Field.Label>Workspace URL</Field.Label>
  <Field.Input placeholder="acme" value="not a url" />
  <Field.ErrorText>Use lowercase letters, numbers and dashes.</Field.ErrorText>
</Field.Root>
