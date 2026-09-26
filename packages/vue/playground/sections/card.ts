/**
 * Card — CSS-only surface: its compound anatomy survives serialisation part
 * by part.
 */
import { h } from "vue";
import { Button } from "../../src/button.js";
import { Card } from "../../src/card.js";
import type { Section } from "../section.js";

const CardSection: Section = () =>
  h("section", { "aria-label": "cards" }, [
    h(Card.Root, { variant: "outline", size: "md" }, () => [
      h(Card.Header, {}, () => [
        h(Card.Title, {}, () => "Monthly report"),
        h(Card.Description, {}, () => "Revenue across every channel."),
      ]),
      h(Card.Content, {}, () => "Up 12% on last month."),
      h(Card.Footer, {}, () => h(Button, { variant: "outline", size: "sm" }, () => "Export")),
    ]),
  ]);

export default CardSection;
