<!--
  A Field with a Textarea — same wiring, a minimum height, vertical resize
  only — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Field } from "@moderno-ui/svelte";
</script>

<Field.Root>
  <Field.Label>Bio</Field.Label>
  <Field.Textarea placeholder="Tell us about yourself" />
  <Field.HelperText>A few sentences is plenty.</Field.HelperText>
</Field.Root>
