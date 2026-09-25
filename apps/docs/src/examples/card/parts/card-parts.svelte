<script lang="ts">
  import { Button, Card } from "@moderno-ui/svelte";
</script>

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
