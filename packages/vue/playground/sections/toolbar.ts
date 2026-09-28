/**
 * Toolbar — the toolbar machine from `@moderno-ui/core`, bound with
 * `@zag-js/vue`: its root id and every item's value come from `useId`, and
 * every item is a Tab stop until the machine finds the first one after
 * mounting. A pressed toggle, a disabled button, a text readout and a Menu
 * trigger ride along; the tooltips render in a Portal, so not on the server.
 */
import { h } from "vue";
import { Menu } from "../../src/menu.js";
import { Toolbar } from "../../src/toolbar.js";
import type { Section } from "../section.js";

const icon = (glyph: string) => () => h("span", { "aria-hidden": "true" }, glyph);

const ToolbarSection: Section = ({ open }) =>
  h("section", { "aria-label": "toolbars" }, [
    h(Toolbar.Root, { "aria-label": "Canvas tools" }, () => [
      h(Toolbar.Button, { label: "Undo", shortcut: "⌘Z" }, icon("↶")),
      h(Toolbar.Button, { label: "Redo", shortcut: "⇧⌘Z", disabled: true }, icon("↷")),
      h(Toolbar.Separator),
      h(Toolbar.Group, { "aria-label": "Text style" }, () => [
        h(Toolbar.Toggle, { label: "Bold", defaultPressed: true }, icon("B")),
        h(Toolbar.Toggle, { label: "Italic" }, icon("I")),
      ]),
      h(Toolbar.Separator),
      h("span", null, "100%"),
      h(Menu.Root, { defaultOpen: open }, () => [
        h(Menu.Trigger, { asChild: true }, () => h(Toolbar.Button, { label: "More" }, icon("⋯"))),
        h(Menu.Positioner, null, () =>
          h(Menu.Content, null, () => h(Menu.Item, { value: "export" }, () => "Export")),
        ),
      ]),
    ]),
    h(Toolbar.Root, { "aria-label": "Drawing tools", orientation: "vertical", size: "sm" }, () => [
      h(Toolbar.Button, null, () => "Select"),
      h(Toolbar.Button, null, () => "Pen"),
    ]),
  ]);

export default ToolbarSection;
