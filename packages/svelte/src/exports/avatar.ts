import { Avatar as ArkAvatar } from "@ark-ui/svelte";
import AvatarRoot from "../AvatarRoot.svelte";

/**
 * Avatar — a picture of a person or a team, with initials when there is none.
 * Ark shows `Fallback` while the image loads or when it fails, `Image` once it
 * has loaded; only `Root` is wrapped (to inject the `size` × `shape` recipe),
 * every other part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Avatar: Omit<typeof ArkAvatar, "Root"> & { Root: typeof AvatarRoot } = {
  ...ArkAvatar,
  Root: AvatarRoot,
};
export type { AvatarSize, AvatarShape } from "@moderno-ui/core";
export type { AvatarStatusChangeDetails } from "@ark-ui/svelte";
