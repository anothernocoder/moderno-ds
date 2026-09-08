<!-- Alert.Description — the supporting detail under the title. -->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { AlertPartProps } from "./alert-props.js";

  let { children, ...rest }: AlertPartProps = $props();
</script>

<div {...rest} {...partAttrs("alert", "description")}>
  {@render children?.()}
</div>
