<script lang="ts">
  import { Checkbox } from "@moderno-ui/svelte";
</script>

<Checkbox.Root>
  <Checkbox.Control>
    <Checkbox.Indicator>✓</Checkbox.Indicator>
  </Checkbox.Control>
  <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
  <Checkbox.HiddenInput />
</Checkbox.Root>
