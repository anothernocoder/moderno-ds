<!-- A FileUpload in a Field with a label, helper text and, when invalid, error text. -->
<script lang="ts">
  import { Field, FileUpload } from "../../src/index.js";

  let { invalid = false, disabled = false }: { invalid?: boolean; disabled?: boolean } = $props();
</script>

<Field.Root {invalid} {disabled}>
  <Field.Label>Logo</Field.Label>
  <FileUpload accept={["image/svg+xml", "image/png"]} />
  <Field.HelperText>Square works best.</Field.HelperText>
  <Field.ErrorText>Add a logo.</Field.ErrorText>
</Field.Root>
