<!--
  TagsInput.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's attribute
  rides along and components.css sizes the parts from it. `children` and
  every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { TagsInput as ArkTagsInput } from "@ark-ui/svelte";
  import type { TagsInputRootProps } from "@ark-ui/svelte";
  import { tagsInputRecipe, type TagsInputSize } from "@moderno-ui/core";

  let { size, ...rest }: TagsInputRootProps & { size?: TagsInputSize } = $props();
</script>

<ArkTagsInput.Root {...rest} {...tagsInputRecipe({ size })} />
