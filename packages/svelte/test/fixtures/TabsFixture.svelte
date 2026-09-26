<script lang="ts">
  import { Tabs } from "../../src/index.js";
  import type { TabsSize, TabsValueChangeDetails, TabsVariant } from "../../src/index.js";

  let {
    variant = undefined,
    size = undefined,
    orientation = undefined,
    activationMode = undefined,
    defaultValue = "account",
    onValueChange = undefined,
  }: {
    variant?: TabsVariant;
    size?: TabsSize;
    orientation?: "horizontal" | "vertical";
    activationMode?: "automatic" | "manual";
    defaultValue?: string;
    onValueChange?: (details: TabsValueChangeDetails) => void;
  } = $props();

  const tabs = [
    { value: "account", label: "Account" },
    { value: "password", label: "Password" },
    { value: "billing", label: "Billing", disabled: true },
    { value: "team", label: "Team" },
  ];
</script>

<Tabs.Root
  {variant}
  {size}
  {orientation}
  {activationMode}
  {defaultValue}
  {onValueChange}
  class="settings"
>
  <Tabs.List aria-label="Settings">
    {#each tabs as tab (tab.value)}
      <Tabs.Trigger value={tab.value} disabled={tab.disabled}>{tab.label}</Tabs.Trigger>
    {/each}
    <Tabs.Indicator />
  </Tabs.List>
  {#each tabs as tab (tab.value)}
    <Tabs.Content value={tab.value}>{tab.label} panel</Tabs.Content>
  {/each}
</Tabs.Root>
