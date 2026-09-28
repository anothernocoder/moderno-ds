import { Editable as ArkEditable } from "@ark-ui/svelte";
import EditableRoot from "../EditableRoot.svelte";
import EditablePreview from "../EditablePreview.svelte";
import EditableInput from "../EditableInput.svelte";

/**
 * Editable — text that turns into an input to rename something in place: a
 * layer, a slide, a file. Double click the text (or set `activationMode`),
 * type, then Enter or a click away saves and Escape cancels. Ark drives the
 * machine: it swaps the `Preview` for the `Input`, saves on Enter and on
 * blur (`submitMode`), cancels on Escape, and wires the optional
 * `EditTrigger`, `SubmitTrigger` and `CancelTrigger`. `Root`, `Preview` and
 * `Input` are wrapped (the recipe, the double-click default, the value put
 * back on Escape, the text selected, focus back to the text, the keys that
 * start an edit, the names and the tooltip); every other part is Ark's
 * verbatim. Annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const Editable: Omit<typeof ArkEditable, "Root" | "Preview" | "Input"> & {
  Root: typeof EditableRoot;
  Preview: typeof EditablePreview;
  Input: typeof EditableInput;
} = {
  ...ArkEditable,
  Root: EditableRoot,
  Preview: EditablePreview,
  Input: EditableInput,
};
export type { EditableActivationMode, EditableSize } from "@moderno-ui/core";
export type { ModernoEditableRootProps } from "../editable-props.js";
export type { EditableValueChangeDetails } from "@ark-ui/svelte";
