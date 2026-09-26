<!--
  Checkbox — Ark's checkbox machine: the checked, indeterminate and disabled
  states reach the control on the server, beside a visually hidden native
  input.
-->
<script lang="ts">
  import { Checkbox } from "../../src/exports/checkbox.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="checkboxes">
  <Checkbox.Root defaultChecked>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
      <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Email me updates</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
  <Checkbox.Root size="sm" defaultChecked="indeterminate">
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
      <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Select all</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
  <Checkbox.Root size="lg" disabled>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Unavailable</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
</section>
