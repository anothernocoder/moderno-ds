/**
 * Accordion — Ark's accordion machine over collapsible items: the open items
 * reach the server string, and every content is a region labelled by its own
 * trigger's id.
 */
import { h } from "vue";
import { Accordion } from "../../src/accordion.js";
import type { Section } from "../section.js";

const AccordionSection: Section = () =>
  h("section", { "aria-label": "accordion" }, [
    h(Accordion.Root, { defaultValue: ["shipping"] }, () => [
      h(Accordion.Item, { value: "shipping" }, () => [
        h(Accordion.ItemTrigger, {}, () => ["Shipping", h(Accordion.ItemIndicator, {}, () => "⌄")]),
        h(Accordion.ItemContent, {}, () => "Shipping answer"),
      ]),
      h(Accordion.Item, { value: "returns" }, () => [
        h(Accordion.ItemTrigger, {}, () => ["Returns", h(Accordion.ItemIndicator, {}, () => "⌄")]),
        h(Accordion.ItemContent, {}, () => "Returns answer"),
      ]),
    ]),
    h(
      Accordion.Root,
      { variant: "enclosed", size: "sm", multiple: true, defaultValue: ["support"] },
      () => [
        h(Accordion.Item, { value: "warranty", disabled: true }, () => [
          h(Accordion.ItemTrigger, {}, () => [
            "Warranty",
            h(Accordion.ItemIndicator, {}, () => "⌄"),
          ]),
          h(Accordion.ItemContent, {}, () => "Warranty answer"),
        ]),
        h(Accordion.Item, { value: "support" }, () => [
          h(Accordion.ItemTrigger, {}, () => [
            "Support",
            h(Accordion.ItemIndicator, {}, () => "⌄"),
          ]),
          h(Accordion.ItemContent, {}, () => "Support answer"),
        ]),
      ],
    ),
  ]);

export default AccordionSection;
