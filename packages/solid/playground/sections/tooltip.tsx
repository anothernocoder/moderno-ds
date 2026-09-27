/**
 * Tooltip — Ark's tooltip machine, positioned inline (no portal) so the
 * content reaches the server string: hidden while closed, with the size on
 * the content and the trigger's `aria-describedby` wired once `open` shows it.
 */
import { Tooltip } from "../../src/tooltip.jsx";
import type { Section } from "../section.js";

const TooltipSection: Section = (props) => (
  <section aria-label="tooltip">
    <Tooltip.Root defaultOpen={props.open}>
      <Tooltip.Trigger>Save</Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          <Tooltip.Arrow>
            <Tooltip.ArrowTip />
          </Tooltip.Arrow>
          Save your changes
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
    <Tooltip.Root size="sm">
      <Tooltip.Trigger>Share</Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>Copy a link</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  </section>
);

export default TooltipSection;
