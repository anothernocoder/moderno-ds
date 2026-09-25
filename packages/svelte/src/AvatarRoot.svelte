<!--
  Avatar.Root with the Moderno `size` × `shape` recipe folded in. Ark's Root
  spreads unknown props onto its data-part="root" element, so the recipe's
  data-size / data-shape ride along and components.css keys off them.
  `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Avatar as ArkAvatar } from "@ark-ui/svelte";
  import type { AvatarRootProps } from "@ark-ui/svelte";
  import { avatarRecipe, type AvatarShape, type AvatarSize } from "@moderno-ui/core";

  let {
    size,
    shape,
    ...rest
  }: AvatarRootProps & { size?: AvatarSize; shape?: AvatarShape } = $props();
</script>

<ArkAvatar.Root {...rest} {...avatarRecipe({ size, shape })} />
