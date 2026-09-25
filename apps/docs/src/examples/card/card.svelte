<!--
  A card with every part, at the default outline variant and size —
  @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Button, Card } from "@moderno-ui/svelte";
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Monthly revenue</Card.Title>
    <Card.Description>Across every workspace on the plan.</Card.Description>
  </Card.Header>
  <Card.Content>Up 12% on last month.</Card.Content>
  <Card.Footer>
    <Button variant="outline" size="sm">Export</Button>
  </Card.Footer>
</Card.Root>
