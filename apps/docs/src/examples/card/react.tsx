/**
 * A card with every part, at the default outline variant and size —
 * @moderno-ui/react.
 */
import { Button, Card } from "@moderno-ui/react";

export function CardDemo() {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Monthly revenue</Card.Title>
        <Card.Description>Across every workspace on the plan.</Card.Description>
      </Card.Header>
      <Card.Content>Up 12% on last month.</Card.Content>
      <Card.Footer>
        <Button variant="outline" size="sm">
          Export
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}
