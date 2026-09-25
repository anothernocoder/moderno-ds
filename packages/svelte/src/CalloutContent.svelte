<!-- Callout.Content — the text column beside the icon (title + description). -->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { CalloutPartProps } from "./callout-props.js";

  let { children, ...rest }: CalloutPartProps = $props();
</script>

<div {...rest} {...partAttrs("callout", "content")}>
  {@render children?.()}
</div>
