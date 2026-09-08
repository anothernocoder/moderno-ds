<!--
  Alert.Icon — the status glyph slot. A primitive never depends on an icon set,
  so the consumer passes their own; the part only positions it and hands down
  the status hue through currentColor. Decorative by default (the status is
  already carried by the root's role), hence aria-hidden.
-->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { AlertPartProps } from "./alert-props.js";

  let { children, "aria-hidden": ariaHidden, ...rest }: AlertPartProps = $props();
</script>

<div {...rest} aria-hidden={ariaHidden ?? true} {...partAttrs("alert", "icon")}>
  {@render children?.()}
</div>
