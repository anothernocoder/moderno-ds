<script lang="ts">
  import { ToggleGroup } from "@moderno-ui/svelte";
</script>

<ToggleGroup.Root
  orientation="vertical"
  variant="outline"
  defaultValue={["middle"]}
  aria-label="Vertical alignment"
>
  <ToggleGroup.Item value="top">Top</ToggleGroup.Item>
  <ToggleGroup.Item value="middle">Middle</ToggleGroup.Item>
  <ToggleGroup.Item value="bottom">Bottom</ToggleGroup.Item>
</ToggleGroup.Root>
