<script lang="ts">
  import { RadioGroup } from "@moderno-ui/svelte";

  const speeds = [
    { value: "standard", label: "Standard", description: "3–5 business days" },
    { value: "express", label: "Express", description: "1–2 business days" },
    { value: "overnight", label: "Overnight", description: "Next business day" },
  ];
</script>

<RadioGroup.Root defaultValue="standard">
  <RadioGroup.Label>Shipping</RadioGroup.Label>
  {#each speeds as speed (speed.value)}
    <RadioGroup.Item value={speed.value}>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>
        {speed.label}
        <RadioGroup.ItemDescription>{speed.description}</RadioGroup.ItemDescription>
      </RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  {/each}
</RadioGroup.Root>
