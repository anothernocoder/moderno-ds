import { TagsInput as ArkTagsInput } from "@ark-ui/svelte";
import TagsInputRoot from "../TagsInputRoot.svelte";

/**
 * TagsInput — a text box that turns what the user types into a row of tags
 * they can edit and remove. Ark drives all of it: Enter or the `delimiter`
 * adds the typed text as a tag, Backspace and each tag's `ItemDeleteTrigger`
 * remove one, the arrow keys move between tags, and a double click (or Enter
 * on a highlighted tag) edits it in place. The value is a `string[]`. `Root`
 * is wrapped to inject the `size` recipe; every other part is Ark's verbatim.
 * Annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const TagsInput: Omit<typeof ArkTagsInput, "Root"> & { Root: typeof TagsInputRoot } = {
  ...ArkTagsInput,
  Root: TagsInputRoot,
};
export type { TagsInputSize } from "@moderno-ui/core";
export type {
  TagsInputValueChangeDetails,
  TagsInputInputValueChangeDetails,
  TagsInputHighlightChangeDetails,
  TagsInputValidityChangeDetails,
} from "@ark-ui/svelte";
