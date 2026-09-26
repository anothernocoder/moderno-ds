<script setup lang="ts">
import { Tabs } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-stack">
    <Tabs.Root size="sm" default-value="overview">
      <Tabs.List aria-label="Small tabs">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="overview">A summary of the project.</Tabs.Content>
      <Tabs.Content value="activity">The latest changes.</Tabs.Content>
    </Tabs.Root>
    <Tabs.Root size="md" default-value="overview">
      <Tabs.List aria-label="Medium tabs">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="overview">A summary of the project.</Tabs.Content>
      <Tabs.Content value="activity">The latest changes.</Tabs.Content>
    </Tabs.Root>
    <Tabs.Root size="lg" default-value="overview">
      <Tabs.List aria-label="Large tabs">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="overview">A summary of the project.</Tabs.Content>
      <Tabs.Content value="activity">The latest changes.</Tabs.Content>
    </Tabs.Root>
  </div>
</template>
