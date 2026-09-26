<script lang="ts">
  import { RadioGroup } from "@moderno-ui/svelte";

  const sizes = [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
  ] as const;
</script>

<div class="demo-row">
  {#each sizes as size (size.value)}
    <RadioGroup.Root size={size.value} defaultValue="yes">
      <RadioGroup.Label>{size.label}</RadioGroup.Label>
      <RadioGroup.Item value="yes">
        <RadioGroup.ItemControl />
        <RadioGroup.ItemText>Yes</RadioGroup.ItemText>
        <RadioGroup.ItemHiddenInput />
      </RadioGroup.Item>
      <RadioGroup.Item value="no">
        <RadioGroup.ItemControl />
        <RadioGroup.ItemText>No</RadioGroup.ItemText>
        <RadioGroup.ItemHiddenInput />
      </RadioGroup.Item>
    </RadioGroup.Root>
  {/each}
</div>
