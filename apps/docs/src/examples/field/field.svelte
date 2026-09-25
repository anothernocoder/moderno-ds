<script lang="ts">
  import { Field } from "@moderno-ui/svelte";
</script>

<Field.Root>
  <Field.Label>Email</Field.Label>
  <Field.Input type="email" placeholder="you@example.com" />
  <Field.HelperText>We only use it to send receipts.</Field.HelperText>
</Field.Root>
