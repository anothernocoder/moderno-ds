<script lang="ts">
  import { Editable } from "@moderno-ui/svelte";
</script>

<Editable.Root defaultValue="Voice-over" activationMode="click">
  <Editable.Label>Track name</Editable.Label>
  <Editable.Area>
    <Editable.Input />
    <Editable.Preview />
  </Editable.Area>
</Editable.Root>
