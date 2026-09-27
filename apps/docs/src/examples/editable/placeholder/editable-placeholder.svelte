<script lang="ts">
  import { Editable } from "@moderno-ui/svelte";
</script>

<Editable.Root placeholder="Untitled" maxLength={32}>
  <Editable.Label>File name</Editable.Label>
  <Editable.Area>
    <Editable.Input />
    <Editable.Preview />
  </Editable.Area>
</Editable.Root>
