<!-- A ColorPicker in a Field with a label, helper text and, when invalid, error text. -->
<script lang="ts">
  import { ColorPicker, Field } from "../../src/index.js";

  let { invalid = false, disabled = false }: { invalid?: boolean; disabled?: boolean } = $props();
</script>

<Field.Root {invalid} {disabled}>
  <Field.Label>Brand color</Field.Label>
  <ColorPicker defaultValue="#1E90FF" />
  <Field.HelperText>Used for buttons and links.</Field.HelperText>
  <Field.ErrorText>Pick a darker colour.</Field.ErrorText>
</Field.Root>
