<!--
  Card — a compound, CSS-only surface: every part serialises its own
  `data-part` and the root its recipe attributes.
-->
<script lang="ts">
  import { Button } from "../../src/exports/button.js";
  import { Card } from "../../src/exports/card.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="cards">
  <Card.Root variant="outline" size="md">
    <Card.Header>
      <Card.Title>Monthly report</Card.Title>
      <Card.Description>Revenue across every channel.</Card.Description>
    </Card.Header>
    <Card.Content>Up 12% on last month.</Card.Content>
    <Card.Footer>
      <Button variant="outline" size="sm">Export</Button>
    </Card.Footer>
  </Card.Root>
</section>
