<!--
  A captioned vertical Divider between two alternative fields — the
  caption turns sideways and the rule runs the height of the row —
  @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Divider, Field } from "@moderno-ui/svelte";
</script>

<div class="demo-row">
  <Field.Root>
    <Field.Label>Phone</Field.Label>
    <Field.Input type="tel" placeholder="+1 555 0100" />
    <Field.HelperText>We text you a code.</Field.HelperText>
  </Field.Root>
  <Divider orientation="vertical">or</Divider>
  <Field.Root>
    <Field.Label>Email</Field.Label>
    <Field.Input type="email" placeholder="you@example.com" />
    <Field.HelperText>We email you a link.</Field.HelperText>
  </Field.Root>
</div>
