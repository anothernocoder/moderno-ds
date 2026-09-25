import { Avatar as ArkAvatar } from "@ark-ui/react";
import type { AvatarRootProps } from "@ark-ui/react";
import { avatarRecipe, type AvatarShape, type AvatarSize } from "@moderno-ui/core";

export type { AvatarShape, AvatarSize } from "@moderno-ui/core";

export interface ModernoAvatarRootProps extends AvatarRootProps {
  /** Box size — resolves to `data-size` on the root part. */
  size?: AvatarSize;
  /** Outline — `circle` for a person, `square` for a team or product. */
  shape?: AvatarShape;
}

/**
 * Avatar.Root with the Moderno `size` × `shape` recipe folded in. Ark's Root
 * spreads unknown props onto its `data-part="root"` element, so the recipe's
 * `data-size`/`data-shape` ride along and `components.css` keys off them.
 */
function AvatarRoot({ size, shape, ...props }: ModernoAvatarRootProps) {
  return <ArkAvatar.Root {...props} {...avatarRecipe({ size, shape })} />;
}

/**
 * Avatar — a picture of a person or a team, with initials when there is none.
 *
 * Ark drives the image-loading machine: `Avatar.Fallback` shows while the
 * image loads and when it fails, `Avatar.Image` once it has loaded, and each
 * carries `data-state="visible|hidden"` plus the `hidden` attribute. The
 * recipe only adds the `size` and `shape` a consumer picks. Anatomy:
 * `Root > Image + Fallback`. Only `Root` is wrapped; every other part is Ark's
 * verbatim, so parts Ark adds later ride along through the spread. The object
 * is annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
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
} from "@ark-ui/react";
