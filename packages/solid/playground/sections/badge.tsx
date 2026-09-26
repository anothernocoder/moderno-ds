/**
 * Badge — CSS-only; proves the optional dot part reaches the server.
 */
import { Badge } from "../../src/badge.jsx";
import type { Section } from "../section.js";

const BadgeSection: Section = () => (
  <section aria-label="badges">
    <Badge>Draft</Badge>
    <Badge variant="success" dot>
      Paid
    </Badge>
    <Badge variant="error" size="sm">
      Overdue
    </Badge>
  </section>
);

export default BadgeSection;
