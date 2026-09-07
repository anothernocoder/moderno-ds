<!--
  Alert.Root — an inline, page-level status message, ported to Svelte 5.

  Identical contract to @moderno-ui/react: a CSS-only primitive (Ark has no
  alert machine — there is no behaviour to own) whose root carries
  data-scope/data-part plus the shared alertRecipe's data-variant/data-size.
  Zero styling lives here; components.css paints it from token slots.

  role defaults from the shared alertRole, resolved like Button's type rather
  than spread over: a consumer's role wins, but passing undefined keeps the
  default instead of erasing the attribute. The scope/part/variant attrs spread
  last so they can't be clobbered.
-->
<script lang="ts">
  import { alertRecipe, alertRole, partAttrs } from "@moderno-ui/core";
  import type { AlertRootProps } from "./alert-props.js";

  let { variant, size, role, children, ...rest }: AlertRootProps = $props();
</script>

<div
  {...rest}
  role={role ?? alertRole(variant)}
  {...partAttrs("alert", "root")}
  {...alertRecipe({ variant, size })}
>
  {@render children?.()}
</div>
