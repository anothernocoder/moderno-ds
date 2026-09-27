/**
 * Drawer — Ark's dialog machine under the "drawer" scope: the trigger's
 * `aria-controls` and the content's `aria-labelledby` / `aria-describedby`
 * come from `useId`, and the recipe's placement travels from the Root to
 * the Positioner and Content through context. The parts are rendered in
 * place (no Portal), so the closed panel reaches the server string and
 * hydrates too; `open` mounts the first one open.
 */
import { Drawer } from "../../src/drawer.js";
import type { Section } from "../section.js";

const DrawerSection: Section = ({ open }) => (
  <section aria-label="drawer">
    <Drawer.Root defaultOpen={open}>
      <Drawer.Trigger>Filters</Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.Description>Narrow the list of orders.</Drawer.Description>
          <Drawer.CloseTrigger aria-label="Close">×</Drawer.CloseTrigger>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
    <Drawer.Root placement="bottom">
      <Drawer.Trigger>Share</Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Title>Share</Drawer.Title>
          <Drawer.Description>Send this page to your team.</Drawer.Description>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  </section>
);

export default DrawerSection;
