/**
 * Menu — Ark's menu machine: the trigger's `aria-controls` and the content's
 * `aria-labelledby` come from `useId`, and must agree across server and
 * client. The content is rendered in place, not in a Portal, so the server
 * string carries the whole anatomy — group, separator, checkbox item and a
 * submenu — hidden while closed. `open` mounts it open.
 */
import { h, type Component } from "vue";
import { Menu } from "../../src/menu.js";
import type { Section } from "../section.js";

const MenuSection: Section = ({ open }) =>
  h("section", { "aria-label": "menu" }, [
    h(Menu.Root as unknown as Component, { size: "sm", defaultOpen: open }, () => [
      h(Menu.Trigger, {}, () => ["Actions ", h(Menu.Indicator, {}, () => "▾")]),
      h(Menu.Positioner, {}, () =>
        h(Menu.Content, {}, () => [
          h(Menu.ItemGroup, {}, () => [
            h(Menu.ItemGroupLabel, {}, () => "File"),
            h(Menu.Item, { value: "new" }, () => "New file"),
            h(Menu.Item, { value: "rename", disabled: true }, () => "Rename"),
          ]),
          h(Menu.Separator),
          h(Menu.CheckboxItem, { value: "wrap", checked: true }, () => [
            h(Menu.ItemText, {}, () => "Word wrap"),
            h(Menu.ItemIndicator, {}, () => "✓"),
          ]),
          h(Menu.Root as unknown as Component, {}, () => [
            h(Menu.TriggerItem, {}, () => "Share"),
            h(Menu.Positioner, {}, () =>
              h(Menu.Content, {}, () => h(Menu.Item, { value: "email" }, () => "Email")),
            ),
          ]),
        ]),
      ),
    ]),
  ]);

export default MenuSection;
