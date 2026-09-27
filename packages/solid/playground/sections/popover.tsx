/**
 * Popover — Ark's popover machine: the trigger's `aria-expanded` /
 * `aria-controls` and the content's `aria-labelledby` / `aria-describedby`
 * ids, and the recipe's size travelling from the Root to the Content through
 * context. The content is rendered in place (no Portal, which is client-only
 * in Solid), so the closed surface reaches the server string; `open` mounts
 * the first one open.
 */
import { Popover } from "../../src/popover.jsx";
import type { Section } from "../section.js";

const PopoverSection: Section = (props) => (
  <section aria-label="popover">
    <Popover.Root defaultOpen={props.open}>
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
