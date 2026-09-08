<!-- Card.Header — the title/description block. -->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { CardDivPartProps } from "./card-props.js";

  let { children, ...rest }: CardDivPartProps = $props();
</script>

<div {...rest} {...partAttrs("card", "header")}>
  {@render children?.()}
</div>
