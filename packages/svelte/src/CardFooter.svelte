<!-- Card.Footer — the actions row. -->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { CardDivPartProps } from "./card-props.js";

  let { children, ...rest }: CardDivPartProps = $props();
</script>

<div {...rest} {...partAttrs("card", "footer")}>
  {@render children?.()}
</div>
