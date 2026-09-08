/**
 * Card across its surface variants — @moderno-ui/react, the same demo every
 * framework's example shows. Painted by @moderno-ui/css from the active
 * theme; no styling in this file.
 */
import { Button, Card } from "@moderno-ui/react";

const variants = [
  {
    variant: "outline" as const,
    title: "Outline",
    description: "The default surface: card fill, 1px border.",
  },
  {
    variant: "muted" as const,
    title: "Muted",
    description: "A recessed well for secondary content.",
  },
  {
    variant: "ghost" as const,
    title: "Ghost",
    description: "The anatomy's rhythm with no surface.",
  },
];

export function CardDemo() {
  return (
    <div className="demo-grid">
      {variants.map((item) => (
        <Card.Root key={item.variant} variant={item.variant}>
          <Card.Header>
            <Card.Title>{item.title}</Card.Title>
            <Card.Description>{item.description}</Card.Description>
          </Card.Header>
          <Card.Content>Up 12% on last month.</Card.Content>
          <Card.Footer>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </Card.Footer>
        </Card.Root>
      ))}
    </div>
  );
}
