<!--
  Alert.Action — the optional row of controls under the description (usually a
  Button or a link). Optional by design: an alert that only reports needs none.
-->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { AlertPartProps } from "./alert-props.js";

  let { children, ...rest }: AlertPartProps = $props();
</script>

<div {...rest} {...partAttrs("alert", "action")}>
  {@render children?.()}
</div>
