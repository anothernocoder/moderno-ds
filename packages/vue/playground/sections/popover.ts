/**
 * Popover — Ark's popover machine: the trigger's `aria-expanded` /
 * `aria-controls` and the content's `aria-labelledby` / `aria-describedby`
 * ids, and the recipe's size travelling from the Root to the Content through
 * provide/inject. The content is rendered in place (no Portal), so the closed
 * surface reaches the server string and hydrates too; `open` mounts the first
 * one open.
 */
import { h } from "vue";
import { Popover } from "../../src/popover.js";
import type { Section } from "../section.js";

const PopoverSection: Section = ({ open }) =>
  h("section", { "aria-label": "popover" }, [
    h(Popover.Root, { defaultOpen: open }, () => [
      h(Popover.Trigger, {}, () => "Share"),
      h(Popover.Positioner, {}, () =>
        h(Popover.Content, {}, () => [
          h(Popover.Arrow, {}, () => h(Popover.ArrowTip)),
          h(Popover.Title, {}, () => "Share this page"),
          h(Popover.Description, {}, () => "Anyone with the link can view it."),
          h(Popover.CloseTrigger, { "aria-label": "Close" }, () => "×"),
        ]),
      ),
    ]),
    h(Popover.Root, { size: "lg" }, () => [
      h(Popover.Trigger, {}, () => ["Storage ", h(Popover.Indicator, {}, () => "▾")]),
      h(Popover.Positioner, {}, () =>
        h(Popover.Content, {}, () => [
          h(Popover.Title, {}, () => "Storage"),
          h(Popover.Description, {}, () => "You have used 8 GB of 10 GB."),
        ]),
      ),
    ]),
  ]);

export default PopoverSection;
