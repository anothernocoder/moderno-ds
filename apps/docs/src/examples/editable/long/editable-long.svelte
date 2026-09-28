<script lang="ts">
  import { Editable } from "@moderno-ui/svelte";
</script>

<Editable.Root defaultValue="Background gradient with a soft grain overlay">
  <Editable.Label>Layer name</Editable.Label>
  <Editable.Area>
    <Editable.Input />
    <Editable.Preview />
  </Editable.Area>
</Editable.Root>
