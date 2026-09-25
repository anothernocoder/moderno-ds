<script setup lang="ts">
import { Card } from "@moderno-ui/vue";
</script>

<template>
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
</template>
