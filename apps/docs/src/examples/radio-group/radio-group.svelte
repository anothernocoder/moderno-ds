<script lang="ts">
  import { RadioGroup } from "@moderno-ui/svelte";

  const plans = [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
    { value: "team", label: "Team" },
  ];
</script>

<RadioGroup.Root defaultValue="pro">
  <RadioGroup.Label>Plan</RadioGroup.Label>
  {#each plans as plan (plan.value)}
    <RadioGroup.Item value={plan.value}>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>{plan.label}</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  {/each}
</RadioGroup.Root>
