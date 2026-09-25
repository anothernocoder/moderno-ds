import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { Avatar as ArkAvatar } from "@ark-ui/vue";
import type { AvatarRootProps, AvatarStatusChangeDetails } from "@ark-ui/vue";
import { avatarRecipe, type AvatarShape, type AvatarSize } from "@moderno-ui/core";

export type { AvatarShape, AvatarSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` × `shape`
 * recipe. Ark-Vue declares the status callback as an emit rather than a prop,
 * so it is spelled out here — a `h()` caller (and a template) passes it as an
 * `onStatusChange` handler, and `inheritAttrs: false` forwards it untouched.
 */
export interface ModernoAvatarRootProps extends AvatarRootProps {
  size?: AvatarSize;
  shape?: AvatarShape;
  onStatusChange?: (details: AvatarStatusChangeDetails) => void;
}

/**
 * Avatar.Root with the Moderno `size` × `shape` recipe folded in. Ark's Root
 * spreads unknown attributes onto its `data-part="root"` element, so the
 * recipe's `data-size`/`data-shape` ride along and `components.css` keys off
 * them.
 */
const AvatarRootImpl = defineComponent({
  name: "ModernoAvatarRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<AvatarSize>, default: undefined },
    shape: { type: String as PropType<AvatarShape>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe attributes).
    const Root = ArkAvatar.Root as unknown as Component;
    return () =>
      h(Root, { ...attrs, ...avatarRecipe({ size: props.size, shape: props.shape }) }, slots);
  },
});

/**
 * Avatar — a picture of a person or a team, with initials when there is none
 * (Ark shows `Fallback` while the image loads or when it fails, `Image` once
 * it has loaded). Only `Root` is wrapped to inject the recipe; every other part
 * is Ark's verbatim, styled by `components.css` keyed on Ark's `data-part`.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Avatar: Omit<typeof ArkAvatar, "Root"> & {
  Root: DefineComponent<ModernoAvatarRootProps>;
} = {
  ...ArkAvatar,
  Root: AvatarRootImpl as unknown as DefineComponent<ModernoAvatarRootProps>,
};

export type {
  AvatarRootProps,
  AvatarImageProps,
  AvatarFallbackProps,
  AvatarStatusChangeDetails,
} from "@ark-ui/vue";
