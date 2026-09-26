<script lang="ts">
  import { Tabs } from "@moderno-ui/svelte";
</script>

<Tabs.Root defaultValue="account">
  <Tabs.List aria-label="Settings">
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="billing" disabled>Billing</Tabs.Trigger>
    <Tabs.Trigger value="team">Team</Tabs.Trigger>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Content value="account">Change your name and email.</Tabs.Content>
  <Tabs.Content value="billing">Billing is managed by your organization.</Tabs.Content>
  <Tabs.Content value="team">Invite people to your workspace.</Tabs.Content>
</Tabs.Root>
