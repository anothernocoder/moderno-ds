<!--
  Card.Title — an h3 by default because a card is a section of a page, not its
  heading. Pass role/aria-level when the document outline needs another rank.
-->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { CardTitleProps } from "./card-props.js";

  let { children, ...rest }: CardTitleProps = $props();
</script>

<h3 {...rest} {...partAttrs("card", "title")}>
  {@render children?.()}
</h3>
