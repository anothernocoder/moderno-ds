/** @jsxImportSource solid-js */
import { Tabs } from "@moderno-ui/solid";

export function TabsSizesDemo() {
  return (
    <div class="demo-stack">
      <Tabs.Root size="sm" defaultValue="overview">
        <Tabs.List aria-label="Small tabs">
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="overview">A summary of the project.</Tabs.Content>
        <Tabs.Content value="activity">The latest changes.</Tabs.Content>
      </Tabs.Root>
      <Tabs.Root size="md" defaultValue="overview">
        <Tabs.List aria-label="Medium tabs">
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="overview">A summary of the project.</Tabs.Content>
        <Tabs.Content value="activity">The latest changes.</Tabs.Content>
      </Tabs.Root>
      <Tabs.Root size="lg" defaultValue="overview">
        <Tabs.List aria-label="Large tabs">
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="overview">A summary of the project.</Tabs.Content>
        <Tabs.Content value="activity">The latest changes.</Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
