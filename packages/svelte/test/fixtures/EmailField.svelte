<script lang="ts">
  import { Field } from "../../src/index.js";
  import type { FieldSize } from "@moderno-ui/core";
  let {
    invalid = false,
    disabled = false,
    size = undefined,
  }: { invalid?: boolean; disabled?: boolean; size?: FieldSize } = $props();
</script>

<Field.Root {invalid} {disabled} {size}>
  <Field.Label>Email</Field.Label>
  <Field.Input placeholder="you@example.com" />
  <Field.HelperText>We never share it.</Field.HelperText>
  <Field.ErrorText>Email is required.</Field.ErrorText>
</Field.Root>
