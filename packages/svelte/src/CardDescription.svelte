<!-- Card.Description — the muted supporting line under the title. -->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { CardDescriptionProps } from "./card-props.js";

  let { children, ...rest }: CardDescriptionProps = $props();
</script>

<p {...rest} {...partAttrs("card", "description")}>
  {@render children?.()}
</p>
