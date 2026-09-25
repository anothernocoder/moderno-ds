<script lang="ts">
  import { Checkbox } from "@moderno-ui/svelte";
</script>

<Checkbox.Root disabled defaultChecked>
  <Checkbox.Control>
    <Checkbox.Indicator>✓</Checkbox.Indicator>
  </Checkbox.Control>
  <Checkbox.Label>Share usage analytics</Checkbox.Label>
  <Checkbox.HiddenInput />
</Checkbox.Root>
