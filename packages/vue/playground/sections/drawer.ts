/**
 * Drawer — Ark's dialog machine under the "drawer" scope: the trigger's
 * `aria-controls` and the content's `aria-labelledby` / `aria-describedby`
 * ids, and the recipe's placement travelling from the Root to the Positioner
 * and Content through provide/inject. The parts are rendered in place (no
 * Portal), so the closed panel reaches the server string and hydrates too;
 * `open` mounts the first one open.
 */
import { h } from "vue";
import { Drawer } from "../../src/drawer.js";
import type { Section } from "../section.js";

const DrawerSection: Section = ({ open }) =>
  h("section", { "aria-label": "drawer" }, [
    h(Drawer.Root, { defaultOpen: open }, () => [
      h(Drawer.Trigger, {}, () => "Filters"),
      h(Drawer.Backdrop),
      h(Drawer.Positioner, {}, () =>
        h(Drawer.Content, {}, () => [
          h(Drawer.Title, {}, () => "Filters"),
          h(Drawer.Description, {}, () => "Narrow the list of orders."),
          h(Drawer.CloseTrigger, { "aria-label": "Close" }, () => "×"),
        ]),
      ),
    ]),
    h(Drawer.Root, { placement: "bottom" }, () => [
      h(Drawer.Trigger, {}, () => "Share"),
      h(Drawer.Backdrop),
      h(Drawer.Positioner, {}, () =>
        h(Drawer.Content, {}, () => [
          h(Drawer.Title, {}, () => "Share"),
          h(Drawer.Description, {}, () => "Send this page to your team."),
        ]),
      ),
    ]),
  ]);

export default DrawerSection;
