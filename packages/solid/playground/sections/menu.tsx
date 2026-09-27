/**
 * Menu — Ark's menu machine: the trigger's `aria-controls` and the content's
 * `aria-labelledby` come from generated ids, and must agree across server and
 * client. The content is rendered in place, not in a Portal (Solid's is
 * client-only), so the server string carries the whole anatomy — group,
 * separator, checkbox item and a submenu — hidden while closed. `open` mounts
 * it open.
 */
import { Menu } from "../../src/menu.jsx";
import type { Section } from "../section.js";

const MenuSection: Section = (props) => (
  <section aria-label="menu">
    <Menu.Root size="sm" defaultOpen={props.open}>
      <Menu.Trigger>
        Actions <Menu.Indicator>▾</Menu.Indicator>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.ItemGroup>
            <Menu.ItemGroupLabel>File</Menu.ItemGroupLabel>
            <Menu.Item value="new">New file</Menu.Item>
            <Menu.Item value="rename" disabled>
              Rename
            </Menu.Item>
          </Menu.ItemGroup>
          <Menu.Separator />
          <Menu.CheckboxItem value="wrap" checked>
            <Menu.ItemText>Word wrap</Menu.ItemText>
            <Menu.ItemIndicator>✓</Menu.ItemIndicator>
          </Menu.CheckboxItem>
          <Menu.Root>
            <Menu.TriggerItem>Share</Menu.TriggerItem>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="email">Email</Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  </section>
);

export default MenuSection;
