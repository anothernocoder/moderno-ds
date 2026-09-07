<!--
  Live Field preview — the real `Field` parts re-exported by @moderno-ui/svelte
  (Ark's, verbatim), across the states components.css actually paints:
  helper text, required indicator, invalid, disabled, and the textarea control.

  Every state is rendered at once on purpose. Field carries no recipe and no
  variants; its whole visual surface is the `data-invalid` / `data-disabled` /
  `data-required` attributes Ark emits, so a preview that shows only the resting
  state would leave most of the stylesheet unwitnessed — and, since this page is
  captured by the visual suite, unguarded.
-->
<script lang="ts">
  import { Field } from "@moderno-ui/svelte";
</script>

<div class="demo-fields">
  <Field.Root>
    <Field.Label>Email</Field.Label>
    <Field.Input type="email" placeholder="you@example.com" />
    <Field.HelperText>We never share it.</Field.HelperText>
  </Field.Root>

  <Field.Root required>
    <Field.Label>
      Full name
      <Field.RequiredIndicator>*</Field.RequiredIndicator>
    </Field.Label>
    <Field.Input placeholder="Ada Lovelace" />
  </Field.Root>

  <Field.Root invalid>
    <Field.Label>Password</Field.Label>
    <Field.Input type="password" value="short" />
    <Field.ErrorText>Must be at least 12 characters.</Field.ErrorText>
  </Field.Root>

  <Field.Root disabled>
    <Field.Label>Workspace</Field.Label>
    <Field.Input value="acme-inc" />
    <Field.HelperText>Set once at sign-up.</Field.HelperText>
  </Field.Root>

  <Field.Root>
    <Field.Label>Notes</Field.Label>
    <Field.Textarea rows={3} placeholder="Anything we should know?" />
  </Field.Root>
</div>

<style>
  /* One column at every width. The preview panel is never wide enough for a
     second one, and a form column narrower than its inputs is worse than a
     stack — so no container query here rather than one that never fires. */
  .demo-fields {
    display: grid;
    gap: var(--spacing-5);
  }
</style>
