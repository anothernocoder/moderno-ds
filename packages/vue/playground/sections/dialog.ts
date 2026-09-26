/**
 * Dialog — a Portal + focus-trap machine that must emit a stable trigger while
 * its content stays unmounted. `open` mounts the content, so its teleported
 * markup and id wiring serialise too.
 */
import { h } from "vue";
import { Dialog, Portal } from "../../src/dialog.js";
import type { Section } from "../section.js";

const DialogSection: Section = ({ open }) =>
  h("section", { "aria-label": "dialog" }, [
    h(Dialog.Root, { defaultOpen: open }, () => [
      h(Dialog.Trigger, {}, () => "Open dialog"),
      h(Portal, {}, () => [
        h(Dialog.Backdrop),
        h(Dialog.Positioner, {}, () =>
          h(Dialog.Content, {}, () => [
            h(Dialog.Title, {}, () => "Delete account"),
            h(Dialog.Description, {}, () => "This action cannot be undone."),
            h(Dialog.CloseTrigger, {}, () => "Cancel"),
          ]),
        ),
      ]),
    ]),
  ]);

export default DialogSection;
