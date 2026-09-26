<!--
  Tabs — Ark's tabs machine: each panel labelled by its own tab's id, the
  selected tab (aria-selected, data-selected), the hidden panels, the
  orientation and a disabled tab reach the server string.
-->
<script lang="ts">
  import { Tabs } from "../../src/exports/tabs.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="tabs">
  <Tabs.Root defaultValue="account">
    <Tabs.List aria-label="Settings">
      <Tabs.Trigger value="account">Account</Tabs.Trigger>
      <Tabs.Trigger value="password">Password</Tabs.Trigger>
      <Tabs.Indicator />
    </Tabs.List>
    <Tabs.Content value="account">Account panel</Tabs.Content>
    <Tabs.Content value="password">Password panel</Tabs.Content>
  </Tabs.Root>
  <Tabs.Root variant="enclosed" size="sm" orientation="vertical" defaultValue="team">
    <Tabs.List aria-label="Workspace">
      <Tabs.Trigger value="billing" disabled>Billing</Tabs.Trigger>
      <Tabs.Trigger value="team">Team</Tabs.Trigger>
      <Tabs.Indicator />
    </Tabs.List>
    <Tabs.Content value="billing">Billing panel</Tabs.Content>
    <Tabs.Content value="team">Team panel</Tabs.Content>
  </Tabs.Root>
</section>
