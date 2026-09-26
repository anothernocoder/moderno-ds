<script lang="ts">
  import { RadioGroup } from "@moderno-ui/svelte";

  const periods = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];
</script>

<RadioGroup.Root orientation="horizontal" defaultValue="monthly">
  <RadioGroup.Label>Billing</RadioGroup.Label>
  {#each periods as period (period.value)}
    <RadioGroup.Item value={period.value}>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>{period.label}</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  {/each}
</RadioGroup.Root>
