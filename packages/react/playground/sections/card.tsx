/**
 * Card — a compound, CSS-only surface: every part must serialise its own
 * `data-part` and the root its recipe attributes.
 */
import { Button } from "../../src/button.js";
import { Card } from "../../src/card.js";
import type { Section } from "../section.js";

const CardSection: Section = () => (
  <section aria-label="cards">
    <Card.Root variant="outline" size="md">
      <Card.Header>
        <Card.Title>Monthly report</Card.Title>
        <Card.Description>Revenue across every channel.</Card.Description>
      </Card.Header>
      <Card.Content>Up 12% on last month.</Card.Content>
      <Card.Footer>
        <Button variant="outline" size="sm">
          Export
        </Button>
      </Card.Footer>
    </Card.Root>
  </section>
);

export default CardSection;
