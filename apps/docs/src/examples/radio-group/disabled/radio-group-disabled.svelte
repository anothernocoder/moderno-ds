<script lang="ts">
  import { RadioGroup } from "@moderno-ui/svelte";

  const options = [
    { value: "courier", label: "Courier" },
    { value: "pickup", label: "Store pickup", disabled: true },
  ];
</script>

<RadioGroup.Root defaultValue="courier">
  <RadioGroup.Label>Delivery</RadioGroup.Label>
  {#each options as option (option.value)}
    <RadioGroup.Item value={option.value} disabled={option.disabled}>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  {/each}
</RadioGroup.Root>
