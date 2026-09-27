<!--
  RadioGroup.ItemMedia — a tile's image, or any other content, above its
  label. Moderno's addition to Ark's anatomy: it keeps the root's aspectRatio
  and crops an image to fill it. ItemText names the radio, so an image here
  takes alt="" unless the item has no ItemText.
-->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { RadioGroupItemMediaProps } from "./radio-group-props.js";

  let { children, ...rest }: RadioGroupItemMediaProps = $props();
</script>

<span {...rest} {...partAttrs("radio-group", "item-media")}>
  {@render children?.()}
</span>
