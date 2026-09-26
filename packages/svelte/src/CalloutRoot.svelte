<!--
  Callout.Root — a soft note inside the page's content, ported to Svelte 5.

  Identical contract to @moderno-ui/react: a CSS-only primitive whose root
  carries data-scope/data-part plus the shared calloutRecipe's data-variant.
  Zero styling lives here; components.css paints it from token slots.

  The root is role="note": a callout is part of the content, not a live region.
  role is resolved rather than spread over: a consumer's role wins, but passing
  undefined keeps the default instead of erasing the attribute. The
  scope/part/variant attrs spread last so they can't be clobbered.
-->
<script lang="ts">
  import { calloutRecipe, partAttrs } from "@moderno-ui/core";
  import type { CalloutRootProps } from "./callout-props.js";

  let { variant, role, children, ...rest }: CalloutRootProps = $props();
</script>

<div {...rest} role={role ?? "note"} {...partAttrs("callout", "root")} {...calloutRecipe({ variant })}>
  {@render children?.()}
</div>
