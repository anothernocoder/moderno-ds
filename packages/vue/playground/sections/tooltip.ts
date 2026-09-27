/**
 * Tooltip — Ark's tooltip machine, positioned inline (no portal) so the
 * content reaches the server string: hidden while closed, with the size on
 * the content and the trigger's `aria-describedby` wired once `open` shows it.
 */
import { h } from "vue";
import { Tooltip } from "../../src/tooltip.js";
import type { Section } from "../section.js";

const TooltipSection: Section = ({ open }) =>
  h("section", { "aria-label": "tooltip" }, [
    h(Tooltip.Root, { defaultOpen: open }, () => [
      h(Tooltip.Trigger, null, () => "Save"),
      h(Tooltip.Positioner, null, () =>
        h(Tooltip.Content, null, () => [
          h(Tooltip.Arrow, null, () => h(Tooltip.ArrowTip)),
          "Save your changes",
        ]),
      ),
    ]),
    h(Tooltip.Root, { size: "sm" }, () => [
      h(Tooltip.Trigger, null, () => "Share"),
      h(Tooltip.Positioner, null, () => h(Tooltip.Content, null, () => "Copy a link")),
    ]),
  ]);

export default TooltipSection;
