<!--
  Callout.Icon — the glyph slot. A primitive never depends on an icon set, so
  the consumer passes their own; the part only positions it and hands down the
  status hue through currentColor. Decorative by default, hence aria-hidden.
-->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { CalloutPartProps } from "./callout-props.js";

  let { children, "aria-hidden": ariaHidden, ...rest }: CalloutPartProps = $props();
</script>

<div {...rest} aria-hidden={ariaHidden ?? true} {...partAttrs("callout", "icon")}>
  {@render children?.()}
</div>
