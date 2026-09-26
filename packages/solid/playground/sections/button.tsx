/**
 * Button — the trivial baseline (no ids, no portal).
 */
import { Button } from "../../src/button.jsx";
import type { Section } from "../section.js";

const ButtonSection: Section = () => (
  <section aria-label="buttons">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost" size="sm">
      Ghost
    </Button>
    <Button variant="destructive" size="lg">
      Destructive
    </Button>
  </section>
);

export default ButtonSection;
