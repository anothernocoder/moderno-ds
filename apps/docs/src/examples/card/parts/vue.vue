<!--
  Every Card part is optional — a header and footer with no content, and a
  content-only card — @moderno-ui/vue.
-->
<script setup lang="ts">
import { Button, Card } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-grid">
    <Card.Root>
      <Card.Header>
        <Card.Title>Invite sent</Card.Title>
        <Card.Description>We emailed a sign-in link to the new member.</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button variant="outline" size="sm">Undo</Button>
      </Card.Footer>
    </Card.Root>
    <Card.Root>
      <Card.Content>A card with nothing but a body is a plain bordered surface.</Card.Content>
    </Card.Root>
  </div>
</template>
