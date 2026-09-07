<!--
  Live Field preview — the real @moderno-ui/svelte primitive across its three
  sizes, over both controls (Input and Textarea) and in the invalid state.
  Hydrated as an island; painted by @moderno-ui/css from the active theme, so it
  re-skins live with the Theme Builder and the color-scheme toggle.
-->
<script lang="ts">
  import { Field } from "@moderno-ui/svelte";
</script>

<div class="demo-stack">
  <Field.Root size="sm">
    <Field.Label>Email</Field.Label>
    <Field.Input placeholder="you@example.com" />
    <Field.HelperText>Small — dense forms and filter bars.</Field.HelperText>
  </Field.Root>

  <Field.Root size="md">
    <Field.Label>Full name</Field.Label>
    <Field.Input placeholder="Ada Lovelace" />
    <Field.HelperText>Medium — the default.</Field.HelperText>
  </Field.Root>

  <Field.Root size="lg" invalid>
    <Field.Label>Workspace URL</Field.Label>
    <Field.Input placeholder="acme" value="not a url" />
    <Field.ErrorText>Use lowercase letters, numbers and dashes.</Field.ErrorText>
  </Field.Root>

  <Field.Root size="md">
    <Field.Label>Bio</Field.Label>
    <Field.Textarea placeholder="Tell us about yourself" />
    <Field.HelperText>Textarea grows vertically; the size sets its floor.</Field.HelperText>
  </Field.Root>

  <Field.Root size="md" disabled>
    <Field.Label>Plan</Field.Label>
    <Field.Input value="Enterprise" />
    <Field.HelperText>Disabled — managed by your administrator.</Field.HelperText>
  </Field.Root>
</div>

<style>
  /* Layout only: the fields themselves carry no styling of their own. */
  .demo-stack {
    display: grid;
    gap: 1.25rem;
    max-width: 24rem;
  }
</style>
