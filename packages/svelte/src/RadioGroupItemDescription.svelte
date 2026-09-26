<!--
  RadioGroup.ItemDescription — a hint under an option's label. Moderno's one
  addition to Ark's anatomy: place it inside RadioGroup.ItemText, which names
  the option's radio, so screen readers read it with the label.
-->
<script lang="ts">
  import { partAttrs } from "@moderno-ui/core";
  import type { RadioGroupItemDescriptionProps } from "./radio-group-props.js";

  let { children, ...rest }: RadioGroupItemDescriptionProps = $props();
</script>

<span {...rest} {...partAttrs("radio-group", "item-description")}>
  {@render children?.()}
</span>
