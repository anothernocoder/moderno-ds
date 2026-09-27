<script lang="ts">
  import { Editable, Field } from "../../src/index.js";
</script>

<Field.Root invalid>
  <Field.Label>Slide title</Field.Label>
  <Editable.Root defaultValue="Intro">
    <Editable.Area>
      <Editable.Input />
      <Editable.Preview />
    </Editable.Area>
  </Editable.Root>
  <Field.HelperText>Shown in the outline.</Field.HelperText>
  <Field.ErrorText>Too short.</Field.ErrorText>
</Field.Root>
