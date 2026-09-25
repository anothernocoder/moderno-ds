<!--
  Card at its three sizes side by side — size on Card.Root sets the
  padding of every part — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Card } from "@moderno-ui/svelte";
</script>

<div class="demo-grid">
  <Card.Root size="sm">
    <Card.Header>
      <Card.Title>Small</Card.Title>
      <Card.Description>Tighter padding for dense dashboards.</Card.Description>
    </Card.Header>
    <Card.Content>Up 12% on last month.</Card.Content>
  </Card.Root>
  <Card.Root size="md">
    <Card.Header>
      <Card.Title>Medium</Card.Title>
      <Card.Description>The default rhythm.</Card.Description>
    </Card.Header>
    <Card.Content>Up 12% on last month.</Card.Content>
  </Card.Root>
  <Card.Root size="lg">
    <Card.Header>
      <Card.Title>Large</Card.Title>
      <Card.Description>More room, and a larger title.</Card.Description>
    </Card.Header>
    <Card.Content>Up 12% on last month.</Card.Content>
  </Card.Root>
</div>
