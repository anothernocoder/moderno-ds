<!--
  Card across its surface variants — @moderno-ui/vue, the same demo every
  framework's example shows. Painted by @moderno-ui/css from the active theme;
  no styling in this file.
-->
<script setup lang="ts">
import { Button, Card } from "@moderno-ui/vue";

const variants = [
  {
    variant: "outline",
    title: "Outline",
    description: "The default surface: card fill, 1px border.",
  },
  { variant: "muted", title: "Muted", description: "A recessed well for secondary content." },
  { variant: "ghost", title: "Ghost", description: "The anatomy's rhythm with no surface." },
] as const;
</script>

<template>
  <div class="demo-grid">
    <Card.Root v-for="item in variants" :key="item.variant" :variant="item.variant">
      <Card.Header>
        <Card.Title>{{ item.title }}</Card.Title>
        <Card.Description>{{ item.description }}</Card.Description>
      </Card.Header>
      <Card.Content>Up 12% on last month.</Card.Content>
      <Card.Footer>
        <Button variant="outline" size="sm">Export</Button>
      </Card.Footer>
    </Card.Root>
  </div>
</template>
