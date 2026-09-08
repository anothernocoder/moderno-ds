<!-- Card.Content — the body. The only part that grows, so footers stay aligned. -->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { CardDivPartProps } from "./card-props.js";

  let { children, ...rest }: CardDivPartProps = $props();
</script>

<div {...rest} {...partAttrs("card", "content")}>
  {@render children?.()}
</div>
