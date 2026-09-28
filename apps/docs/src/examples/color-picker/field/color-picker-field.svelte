<script lang="ts">
  import { ColorPicker, Field } from "@moderno-ui/svelte";
</script>

<Field.Root>
  <Field.Label>Brand color</Field.Label>
  <ColorPicker defaultValue="#1E90FF" />
  <Field.HelperText>Used for buttons and links.</Field.HelperText>
</Field.Root>
