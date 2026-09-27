import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { TagsInput as ArkTagsInput } from "@ark-ui/vue";
import type {
  TagsInputRootProps,
  TagsInputValueChangeDetails,
  TagsInputInputValueChangeDetails,
  TagsInputHighlightChangeDetails,
  TagsInputValidityChangeDetails,
} from "@ark-ui/vue";
import { tagsInputRecipe, type TagsInputSize } from "@moderno-ui/core";

export type { TagsInputSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the change callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onValueChange` / `onUpdate:modelValue` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoTagsInputRootProps extends TagsInputRootProps {
  size?: TagsInputSize;
  onValueChange?: (details: TagsInputValueChangeDetails) => void;
  onInputValueChange?: (details: TagsInputInputValueChangeDetails) => void;
  onHighlightChange?: (details: TagsInputHighlightChangeDetails) => void;
  onValueInvalid?: (details: TagsInputValidityChangeDetails) => void;
  "onUpdate:modelValue"?: (value: string[]) => void;
  "onUpdate:inputValue"?: (value: string) => void;
}

/**
 * TagsInput.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` sizes the parts from it.
 * `defaultValue`, `modelValue`, `max`, `delimiter`, `validate`, … pass
 * straight through via attrs.
 */
const TagsInputRootImpl = defineComponent({
  name: "ModernoTagsInputRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<TagsInputSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkTagsInput.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...tagsInputRecipe({ size: props.size }) }, slots);
  },
});

/**
 * TagsInput — a text box that turns what the user types into a row of tags
 * they can edit and remove. Ark drives all of it: Enter or the `delimiter`
 * adds the typed text as a tag, Backspace and each tag's `ItemDeleteTrigger`
 * remove one, the arrow keys move between tags, and a double click (or Enter
 * on a highlighted tag) edits it in place. The value is a `string[]`. `Root`
 * is wrapped to inject the recipe; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const TagsInput: Omit<typeof ArkTagsInput, "Root"> & {
  Root: DefineComponent<ModernoTagsInputRootProps>;
} = {
  ...ArkTagsInput,
  Root: TagsInputRootImpl as unknown as DefineComponent<ModernoTagsInputRootProps>,
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
} from "@ark-ui/vue";
