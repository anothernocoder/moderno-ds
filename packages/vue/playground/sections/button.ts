/**
 * Button — the trivial baseline (no ids, no portal): every variant and size
 * serialises its recipe attributes.
 */
import { h } from "vue";
import { Button } from "../../src/button.js";
import type { Section } from "../section.js";

const ButtonSection: Section = () =>
  h("section", { "aria-label": "buttons" }, [
    h(Button, { variant: "primary" }, () => "Primary"),
    h(Button, { variant: "secondary" }, () => "Secondary"),
    h(Button, { variant: "outline" }, () => "Outline"),
    h(Button, { variant: "ghost", size: "sm" }, () => "Ghost"),
    h(Button, { variant: "destructive", size: "lg" }, () => "Destructive"),
  ]);

export default ButtonSection;
