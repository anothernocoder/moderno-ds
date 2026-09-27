<script lang="ts">
  import { Editable, Field } from "@moderno-ui/svelte";
</script>

<Field.Root>
  <Field.Label>Slide title</Field.Label>
  <Editable.Root defaultValue="Introduction">
    <Editable.Area>
      <Editable.Input />
      <Editable.Preview />
    </Editable.Area>
  </Editable.Root>
  <Field.HelperText>Shown in the outline.</Field.HelperText>
</Field.Root>
