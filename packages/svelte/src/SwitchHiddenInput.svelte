<!--
  Switch.HiddenInput with role="switch". Ark renders a plain checkbox input,
  which a screen reader would announce as a checkbox; the role makes it say
  "switch, on/off" instead. A consumer `role` still wins; `undefined` keeps the
  default.
-->
<script lang="ts">
  import { Switch as ArkSwitch } from "@ark-ui/svelte";
  import type { SwitchHiddenInputProps } from "@ark-ui/svelte";

  let { role = "switch", ...rest }: SwitchHiddenInputProps = $props();
</script>

<ArkSwitch.HiddenInput {...rest} {role} />
