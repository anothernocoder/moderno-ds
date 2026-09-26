<script setup lang="ts">
import { Tabs } from "@moderno-ui/vue";
</script>

<template>
  <Tabs.Root orientation="vertical" default-value="account">
    <Tabs.List aria-label="Settings">
      <Tabs.Trigger value="account">Account</Tabs.Trigger>
      <Tabs.Trigger value="password">Password</Tabs.Trigger>
      <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
      <Tabs.Indicator />
    </Tabs.List>
    <Tabs.Content value="account">Change your name and email.</Tabs.Content>
    <Tabs.Content value="password">Change your password.</Tabs.Content>
    <Tabs.Content value="notifications">Choose what we email you about.</Tabs.Content>
  </Tabs.Root>
</template>
