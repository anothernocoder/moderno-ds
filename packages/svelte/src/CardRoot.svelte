<!--
  Card.Root — the surface, ported to Svelte 5.

  Identical contract to @moderno-ui/react: no Ark machine (a card tracks no
  state), so the part is authored here carrying data-scope/data-part plus
  cardRecipe's data-variant/data-size. Zero styling lives here — components.css
  paints it from token slots. Consumer attributes spread first; the
  scope/part/variant attrs spread last so they can't be clobbered.
-->
<script lang="ts">
  import { cardRecipe, partAttrs } from "@moderno-ui/core";
  import type { CardRootProps } from "./card-props.js";

  let { variant, size, children, ...rest }: CardRootProps = $props();
</script>

<div {...rest} {...partAttrs("card", "root")} {...cardRecipe({ variant, size })}>
  {@render children?.()}
</div>
