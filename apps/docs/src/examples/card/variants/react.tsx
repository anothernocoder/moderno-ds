import { Button, Card } from "@moderno-ui/react";

export function CardVariantsDemo() {
  return (
    <div className="demo-grid">
      <Card.Root variant="outline">
        <Card.Header>
          <Card.Title>Outline</Card.Title>
          <Card.Description>The default surface: card fill, 1px border.</Card.Description>
        </Card.Header>
        <Card.Content>Up 12% on last month.</Card.Content>
        <Card.Footer>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </Card.Footer>
      </Card.Root>
      <Card.Root variant="muted">
        <Card.Header>
          <Card.Title>Muted</Card.Title>
          <Card.Description>A recessed well for secondary content.</Card.Description>
        </Card.Header>
        <Card.Content>Up 12% on last month.</Card.Content>
        <Card.Footer>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </Card.Footer>
      </Card.Root>
      <Card.Root variant="ghost">
        <Card.Header>
          <Card.Title>Ghost</Card.Title>
          <Card.Description>The anatomy's rhythm with no surface.</Card.Description>
        </Card.Header>
        <Card.Content>Up 12% on last month.</Card.Content>
        <Card.Footer>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
  );
}
