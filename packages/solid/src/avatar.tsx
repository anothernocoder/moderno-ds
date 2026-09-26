import { splitProps } from "solid-js";
import { Avatar as ArkAvatar } from "@ark-ui/solid";
import type { AvatarRootProps } from "@ark-ui/solid";
import { avatarRecipe, type AvatarShape, type AvatarSize } from "@moderno-ui/core";

export type { AvatarShape, AvatarSize } from "@moderno-ui/core";

export type ModernoAvatarRootProps = AvatarRootProps & {
  /** Box size — resolves to `data-size` on the root part. */
  size?: AvatarSize;
  /** Outline — `circle` for a person, `square` for a team or product. */
  shape?: AvatarShape;
};

/**
 * Avatar.Root with the Moderno `size` × `shape` recipe folded in. Ark's Root
 * spreads unknown props onto its `data-part="root"` element, so the recipe's
 * `data-size`/`data-shape` ride along and `components.css` keys off them.
 */
function AvatarRoot(props: ModernoAvatarRootProps) {
  const [local, rest] = splitProps(props, ["size", "shape"]);
  return <ArkAvatar.Root {...rest} {...avatarRecipe({ size: local.size, shape: local.shape })} />;
}

/**
 * Avatar — a picture of a person or a team, with initials when there is none
 * (Ark shows `Fallback` while the image loads or when it fails, `Image` once
 * it has loaded). Only `Root` is wrapped to inject the recipe; every other part
 * is Ark's verbatim, styled by `components.css` keyed on Ark's `data-part`.
 * The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Avatar: Omit<typeof ArkAvatar, "Root"> & { Root: typeof AvatarRoot } = {
  ...ArkAvatar,
  Root: AvatarRoot,
};

export type {
  AvatarRootProps,
  AvatarImageProps,
  AvatarFallbackProps,
  AvatarStatusChangeDetails,
} from "@ark-ui/solid";
