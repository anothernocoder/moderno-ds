<!--
  Live Checkbox preview — the real @moderno-ui/svelte primitive across its three
  states (unchecked, checked, indeterminate), its sizes and the disabled
  affordance. Hydrated as an island; painted by @moderno-ui/css from the active
  theme, so it re-skins live with the Theme Builder and the color-scheme toggle.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example") — the source below the live demo is this file, raw-imported, so
  it cannot drift from what actually renders.
-->
<script lang="ts">
  import { Checkbox } from "@moderno-ui/svelte";
</script>

<div class="demo-row">
  <Checkbox.Root>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
      <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Unchecked</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
  <Checkbox.Root defaultChecked>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
      <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Checked</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
  <Checkbox.Root defaultChecked="indeterminate">
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
      <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Indeterminate</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
  <Checkbox.Root disabled defaultChecked>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
      <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Disabled</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
</div>
<div class="demo-row">
  <Checkbox.Root size="sm" defaultChecked>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Small</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
  <Checkbox.Root size="md" defaultChecked>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Medium</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
  <Checkbox.Root size="lg" defaultChecked>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>Large</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
</div>
