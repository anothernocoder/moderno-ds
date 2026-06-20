<!--
  Button — the reference primitive, ported to Svelte 5.

  Identical contract to @moderno/react: a plain <button> carrying
  data-scope/data-part plus the shared buttonRecipe's data-variant/data-size.
  Zero styling lives here — components.css paints it from token slots. Consumer
  attributes (onclick, aria-*, class) spread first; the scope/part/variant attrs
  spread last so they can't be clobbered, mirroring the React prop order.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { buttonRecipe, partAttrs, type VariantProps } from "@moderno/core";

  type ButtonVariant = NonNullable<VariantProps<typeof buttonRecipe.variants>["variant"]>;
  type ButtonSize = NonNullable<VariantProps<typeof buttonRecipe.variants>["size"]>;

  interface Props extends HTMLButtonAttributes {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children?: Snippet;
  }

  let { variant, size, type, children, ...rest }: Props = $props();
</script>

<button
  type={type ?? "button"}
  {...rest}
  {...partAttrs("button", "root")}
  {...buttonRecipe({ variant, size })}
>
  {@render children?.()}
</button>
