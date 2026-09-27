/**
 * Popover — Ark's popover machine: the trigger's `aria-expanded` /
 * `aria-controls` and the content's `aria-labelledby` / `aria-describedby`
 * come from `useId`, and the recipe's size travels from the Root to the
 * Content through context. The content is rendered in place (no Portal), so
 * the closed surface reaches the server string and hydrates too; `open`
 * mounts the first one open.
 */
import { Popover } from "../../src/popover.js";
import type { Section } from "../section.js";

const PopoverSection: Section = ({ open }) => (
  <section aria-label="popover">
    <Popover.Root defaultOpen={open}>
      <Popover.Trigger>Share</Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Arrow>
            <Popover.ArrowTip />
          </Popover.Arrow>
          <Popover.Title>Share this page</Popover.Title>
          <Popover.Description>Anyone with the link can view it.</Popover.Description>
          <Popover.CloseTrigger aria-label="Close">×</Popover.CloseTrigger>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
    <Popover.Root size="lg">
      <Popover.Trigger>
        Storage <Popover.Indicator>▾</Popover.Indicator>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Title>Storage</Popover.Title>
          <Popover.Description>You have used 8 GB of 10 GB.</Popover.Description>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  </section>
);

export default PopoverSection;
