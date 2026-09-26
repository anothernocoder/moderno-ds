<script lang="ts">
  import { RadioGroup } from "@moderno-ui/svelte";

  const methods = [
    { value: "card", label: "Card" },
    { value: "transfer", label: "Bank transfer" },
  ];
</script>

<RadioGroup.Root invalid>
  <RadioGroup.Label>Payment method</RadioGroup.Label>
  {#each methods as method (method.value)}
    <RadioGroup.Item value={method.value}>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>{method.label}</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  {/each}
</RadioGroup.Root>
