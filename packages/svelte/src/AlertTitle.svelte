<!-- Alert.Title — the one-line summary of the status. -->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { AlertPartProps } from "./alert-props.js";

  let { children, ...rest }: AlertPartProps = $props();
</script>

<div {...rest} {...partAttrs("alert", "title")}>
  {@render children?.()}
</div>
