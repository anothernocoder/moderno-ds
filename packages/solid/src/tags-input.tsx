import { splitProps } from "solid-js";
import { TagsInput as ArkTagsInput } from "@ark-ui/solid";
import type { TagsInputRootProps } from "@ark-ui/solid";
import { tagsInputRecipe, type TagsInputSize } from "@moderno-ui/core";

export type { TagsInputSize } from "@moderno-ui/core";

export type ModernoTagsInputRootProps = TagsInputRootProps & {
  /** Box height, tag height and type — resolves to `data-size` on the root part. */
  size?: TagsInputSize;
};

/**
 * TagsInput.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` sizes the parts from it.
 */
function TagsInputRoot(props: ModernoTagsInputRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkTagsInput.Root {...rest} {...tagsInputRecipe({ size: local.size })} />;
}

/**
 * TagsInput — a text box that turns what the user types into a row of tags
 * they can edit and remove. Ark drives all of it: Enter or the `delimiter`
 * adds the typed text as a tag, Backspace and each tag's `ItemDeleteTrigger`
 * remove one, the arrow keys move between tags, and a double click (or Enter
 * on a highlighted tag) edits it in place. The value is a `string[]`. `Root`
 * is wrapped to inject the recipe; every other part is Ark's verbatim. The
 * object is annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const TagsInput: Omit<typeof ArkTagsInput, "Root"> & {
  Root: typeof TagsInputRoot;
} = {
  ...ArkTagsInput,
  Root: TagsInputRoot,
};

export type {
  TagsInputRootProps,
  TagsInputLabelProps,
  TagsInputControlProps,
  TagsInputInputProps,
  TagsInputClearTriggerProps,
  TagsInputItemProps,
  TagsInputItemPreviewProps,
  TagsInputItemTextProps,
  TagsInputItemDeleteTriggerProps,
  TagsInputItemInputProps,
  TagsInputHiddenInputProps,
  TagsInputValueChangeDetails,
  TagsInputInputValueChangeDetails,
  TagsInputHighlightChangeDetails,
  TagsInputValidityChangeDetails,
} from "@ark-ui/solid";
