<!--
  Alert.Content — the text column beside the icon (title + description +
  action). A part rather than a bare wrapper so consumers can restyle the
  column through [data-part="content"] like every other piece of the anatomy.
-->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { AlertPartProps } from "./alert-props.js";

  let { children, ...rest }: AlertPartProps = $props();
</script>

<div {...rest} {...partAttrs("alert", "content")}>
  {@render children?.()}
</div>
