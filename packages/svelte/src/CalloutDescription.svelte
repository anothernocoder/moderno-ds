<!-- Callout.Description — the body of the note. -->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { CalloutPartProps } from "./callout-props.js";

  let { children, ...rest }: CalloutPartProps = $props();
</script>

<div {...rest} {...partAttrs("callout", "description")}>
  {@render children?.()}
</div>
