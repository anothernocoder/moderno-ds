<script lang="ts">
  import { Field } from "../../src/index.js";
  let { invalid = false, disabled = false }: { invalid?: boolean; disabled?: boolean } = $props();
</script>

<Field.Root {invalid} {disabled}>
  <Field.Label>Email</Field.Label>
  <Field.Input placeholder="you@example.com" />
  <Field.HelperText>We never share it.</Field.HelperText>
  <Field.ErrorText>Email is required.</Field.ErrorText>
</Field.Root>
